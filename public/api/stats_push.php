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

$type = htmlspecialchars(isset($_GET['type']) ? $_GET['type'] : '');
if (!in_array($type, ['action', 'choice']))
    exit();

$name = htmlspecialchars(isset($_GET['name']) ? $_GET['name'] : '');

$currentDate = NOW->format('Y-m-d');
$yesterday = (new DateTime('yesterday'))->format('Y-m-d');

if ($type === 'action') {
    if (!in_array($name, [
        'create',
        'import',
        'export',
        'print',
        'export_labellers'
    ]))
        exit();

    $tableName = 'stats_' . $type . '_' . $name;

    // 07/07/2026
    $default_counters = [
        'create'  => 0, //32782,
        'import'  => 0, //104203,
        'export'  => 0, //54478,
        'print'   => 0, //61689,
        'export_labellers' => 0
    ];

    $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->execute([MYSQL_BASE, $tableName]);
    $count = $stmt->fetchColumn(0);
    if ($count === 0) {
        $sql = "CREATE TABLE " . $tableName . " (date DATE NOT NULL DEFAULT current_timestamp(), counter INT(11) NOT NULL DEFAULT " . $default_counters[$name] . ", PRIMARY KEY (date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
        $stmt = DB->prepare($sql);
        $stmt->execute();
        /*$stmt = DB->prepare("INSERT INTO " . $tableName . " (date, counter) VALUES(:date, :counter)");
        $stmt->execute([':date' => $yesterday, ':counter' => $default_counters[$name]]);*/
    }

    $stmt = DB->prepare("SELECT counter FROM " . $tableName . " WHERE date = :date");
    $stmt->execute([':date' => $currentDate]);
    $counter = $stmt->fetchColumn(0);
    if (!$counter) $counter = 0;
    $counter++;

    $stmt = DB->prepare("REPLACE INTO " . $tableName . " (date, counter) VALUES(:date, :counter)");
    $stmt->execute([':date' => $currentDate, ':counter' => $counter]);
}

if ($type === 'choice') {
    if (!in_array($name, [
        'theme',
        'print',
        'print_format',
        'labels_module_height_mm',
        'labels_module_width_mm',
        'labels_rows_length'
    ]))
        exit();

    $tableName = 'stats_' . $type . '_' . $name;

    $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->execute([MYSQL_BASE, $tableName]);
    $count = $stmt->fetchColumn(0);
    if ($count === 0) {
        $sql = "CREATE TABLE " . $tableName . " (name VARCHAR(255) NOT NULL, counter INT(11) NOT NULL, PRIMARY KEY (name)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci";
        $stmt = DB->prepare($sql);
        $stmt->execute();
    }

    $keys = explode('|', trim(htmlspecialchars(isset($_GET['keys']) ? $_GET['keys'] : '')));
    if (count($keys) > 0) {
        foreach ($keys as $ki) {
            $key = trim($ki);
            if ($key === '')
                continue;

            $stmt = DB->prepare("SELECT * FROM " . $tableName . " WHERE name = ?");
            $stmt->execute([$key]);
            $found = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (is_array($found) && isset($found['counter'])) {
                $stmt = DB->prepare("UPDATE " . $tableName . " SET counter = ? WHERE name = ?");
                $stmt->execute([$found['counter'] + 1, $key]);
            } else {
                $stmt = DB->prepare("INSERT INTO " . $tableName . " (name, counter) VALUES(?, 1)");
                $stmt->execute([$key]);
            }
        }
    }
}
