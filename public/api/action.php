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


if (STATS_ALLOWED && STATS_STRUCTURE_ALLOWED && STATS_ACTION_ALLOWED) {
    $tableName = 'stats_action_' . STATS_ACTION;

    $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->execute([MYSQL_BASE, $tableName]);
    $count = $stmt->fetchColumn(0);
    if ($count === 0) {
        $sql = "CREATE TABLE " . $tableName . " (date date NOT NULL DEFAULT current_timestamp(), struct varchar(10) NOT NULL, counters longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`)), PRIMARY KEY (date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
        $stmt = DB->prepare($sql);
        $stmt->execute();
    }

    $currentDate = NOW->format('Y-m-d');
    $currentHour = (string) ((int) NOW->format('H'));

    $stmt = DB->prepare("SELECT JSON_EXTRACT(" . $tableName . ".counters, '$') AS counters FROM " . $tableName . " WHERE date = ?");
    $stmt->execute([$currentDate]);
    $found = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (is_array($found) && isset($found['counters'])) {
        $counters = json_decode($found['counters'], true);
        if (array_key_exists($currentHour, $counters)) {
            $counters[$currentHour]++;
        } else {
            $counters[$currentHour] = 1;
        }
        $stmt = DB->prepare("UPDATE " . $tableName . " SET counters = ? WHERE date = ?");
        $stmt->execute([json_encode($counters), $currentDate]);
    } else {
        $stmt = DB->prepare("INSERT INTO " . $tableName . " (date, struct, counters) VALUES(?, ?, ?)");
        $stmt->execute([$currentDate, STATS_STRUCTURE, json_encode([$currentHour => 1])]);
    }
}
