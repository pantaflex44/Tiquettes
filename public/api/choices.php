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

require_once(__DIR__ . '/libs/config.php');
require_once(__DIR__ . '/stats.php');

if (STATS_ALLOWED && STATS_CHOICE_ALLOWED) {
    $tableName = 'stats_choice_' . STATS_CHOICE;
    $k = isset($_GET['k']) ? rawurldecode(trim($_GET['k'])) : '';

    $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->execute([MYSQL_BASE, $tableName]);
    $count = $stmt->fetchColumn(0);
    if ($count === 0) {
        $sql = "CREATE TABLE " . $tableName . " (id INT(11) NOT NULL AUTO_INCREMENT, struct VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, counter INT(11) NOT NULL, PRIMARY KEY (id,name)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci";
        $stmt = DB->prepare($sql);
        $stmt->execute();
    }

    if ($k !== '') {
        $exploded = explode('|', $k);
        //$exploded['total'] = count($exploded);

        foreach ($exploded as $ki) {
            $key = trim($ki);
            if ($key === '')
                continue;

            $stmt = DB->prepare("SELECT * FROM " . $tableName . " WHERE struct = ? AND name = ?");
            $stmt->execute([STATS_STRUCTURE, $key]);
            $found = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (is_array($found) && isset($found['counter'])) {
                $stmt = DB->prepare("UPDATE " . $tableName . " SET counter = ? WHERE struct = ? AND name = ?");
                $stmt->execute([$found['counter'] + 1, STATS_STRUCTURE, $key]);
            } else {
                $stmt = DB->prepare("INSERT INTO " . $tableName . " (struct, name, counter) VALUES(?, ?, 1)");
                $stmt->execute([STATS_STRUCTURE, $key]);
            }
        }
    }
}
