<?php

/**
 * Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 * Copyright (C) 2024-2025 Christophe LEMOINE
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

declare(strict_types=1);

require_once(__DIR__ . '/libs/config.php');
require_once(__DIR__ . '/stats.php');

$stats = [];

foreach (STATS_ALLOWED_ACTIONS_FULL as $actionItem) {
    $tableName = 'stats_action_' . $actionItem['key'];
    $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->execute([MYSQL_BASE, $tableName]);
    $count = $stmt->fetchColumn(0);
    if ($count === 1) {
        $stmt = DB->prepare("SELECT * FROM " . $tableName);
        $stmt->execute();
        $founds = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($founds as $found) {
            $counters = json_decode($found['counters'], true);
            $counter = array_sum(array_values($counters));

            // rapprochement des anciennes stats
            $rats = 0;
            if ($actionItem['key'] === 'create')
                $rats = 3425;
            if ($actionItem['key'] === 'print')
                $rats = 6278;

            if (!isset($stats[$actionItem['key']]))
                $stats[$actionItem['key']] = $rats;
            $stats[$actionItem['key']] += $counter;
        }
    }
}

header('Content-type: application/json');
echo json_encode($stats);