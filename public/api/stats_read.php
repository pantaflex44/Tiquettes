<?php

/**
 * Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 * Copyright (C) 2024-2026 Christophe LEMOINE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

require_once(__DIR__ . '/libs/config.php');
require_once(__DIR__ . '/stats.php');

$currentDate = NOW->format('Y-m-d');

$stmt = DB->prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name LIKE 'stats_%' ORDER BY table_name");
$stmt->execute([MYSQL_BASE]);
$tables = $stmt->fetchAll(\PDO::FETCH_ASSOC);

$tables = array_map(fn($i) => substr($i['table_name'], 6), $tables);

$infos = [];
$actions = [
    'totals' => [],
    'day_averages' => []
];
$choices = [];
$keys = ['action', 'choice'];

// 07/07/2026
$defaultCounters = [
    'create'  => 32782,
    'import'  => 104203,
    'export'  => 54478,
    'print'   => 61689,
    'export_labellers' => 0
];

foreach ($tables as $table) {
    $tableName = 'stats_' . $table;

    if (str_starts_with($table, 'action_')) {
        $stmt = DB->prepare("SELECT date, counter FROM " . $tableName . " WHERE date >= DATE_SUB(NOW(), INTERVAL 365 DAY) ORDER BY date ASC");
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        for ($i = 0; $i < count($result); $i++) {
            if (!isset($actions[$result[$i]['date']])) {
                $actions[$result[$i]['date']] = [];
            }
            $date = $result[$i]['date'];
            $action = substr($table, 7);
            $counter = isset($actions[$date][$action]) ? $actions[$date][$action] : 0;
            $counter += $result[$i]['counter'];
            $actions[$date][$action] = $counter;

            if (!isset($actions['totals'][$action])) {
                $actions['totals'][$action] =  isset($defaultCounters[$action]) ? $defaultCounters[$action] : 0;
            }
            $actions['totals'][$action] += $result[$i]['counter'];
        }
    }

    if (str_starts_with($table, 'choice_')) {
        $choice = substr($table, 7);
        if (!isset($choices[$choice])) {
            $choices[$choice] = [];
        }

        $stmt = DB->prepare("SELECT name, counter FROM " . $tableName);
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        for ($i = 0; $i < count($result); $i++) {
            $name = $result[$i]['name'];
            if (!isset($choices[$choice][$name])) {
                $choices[$choice][$name] = 0;
            }
            $choices[$choice][$name] += $result[$i]['counter'];
        }
    }
}

foreach ($actions as $key => $value) {
    if (!str_starts_with($key, 'totals') && !str_starts_with($key, 'day_averages') && $key !== $currentDate) {
        foreach ($value as $action => $counter) {
            if (!isset($actions['day_averages'][$action])) {
                $actions['day_averages'][$action] = ['total' => 0, 'count' => 0, 'average' => 0];
            }
            $actions['day_averages'][$action]['total']++;
            $actions['day_averages'][$action]['count'] += $counter;
            $actions['day_averages'][$action]['average'] = round($actions['day_averages'][$action]['count'] / $actions['day_averages'][$action]['total']);
        }
    }
}

echo json_encode([
    'infos' => $infos,
    'actions' => $actions,
    'choices' => $choices
]);
