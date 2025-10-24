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

if (STATS_ALLOWED && STATS_STRUCTURE_ALLOWED) {
    $currentDate = NOW->format('Y-m-d');
    $currentDatetime = NOW->format('Y-m-d H:i:s');
    $currentHour = (string) ((int) NOW->format('H'));

    $ipGeo = [];
    try {
        $ipGeo = @file_get_contents("http://ip-api.com/json/" . CLIENT_IP);
    } catch (\Exception $ex) {
        $ipGeo['country'] = '_error_';
    }

    $stmt = DB->prepare("SELECT * FROM stats_visits WHERE ip = ? AND url = ?");
    $stmt->execute([CLIENT_IP, REFERER]);
    $found = $stmt->fetch(\PDO::FETCH_ASSOC);
    if ($found !== false) {
        $id = $found['id'];
        $foundDatetime = SQL2DateTimeUTC($found['datetime'], 'Y-m-d H:i:s');
        $compareDatetime = $foundDatetime->add(\DateInterval::createFromDateString(STATS_VISITS_INTERVAL));
        if (NOW >= $compareDatetime) {
            $stmt = DB->prepare("UPDATE stats_visits SET datetime = ?, ua = ?, rfr = ?, country = ?, regionName = ?, city = ?, timezone = ? WHERE id = ?");
            $stmt->execute([
                $currentDatetime,
                USER_AGENT,
                PARENT_REFERER,
                $ipGeo['country'] ?? '',
                $ipGeo['regionName'] ?? '',
                $ipGeo['city'] ?? '',
                $ipGeo['timezone'] ?? '',
                $id
            ]);

            $stmt = DB->prepare("SELECT JSON_EXTRACT(stats_visits_details.counters, '$') AS counters FROM stats_visits_details WHERE visit_id = ? AND date = ?");
            $stmt->execute([$id, $currentDate]);
            $found2 = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($found2 !== false) {
                $counters = json_decode($found2['counters'], true);
                if (array_key_exists($currentHour, $counters)) {
                    $counters[$currentHour]++;
                } else {
                    $counters[$currentHour] = 1;
                }
                $stmt = DB->prepare("UPDATE stats_visits_details SET counters = ? WHERE visit_id = ?");
                $stmt->execute([json_encode($counters), $id]);
            } else {
                $stmt = DB->prepare("INSERT INTO stats_visits_details (visit_id, date, counters) VALUES(?, ?, ?)");
                $stmt->execute([$id, $currentDate, json_encode([$currentHour => 1])]);
            }
        }
    } else {
        $stmt = DB->prepare("INSERT INTO stats_visits (ip, country, regionName, city, timezone, type, struct, url, ua, rfr, datetime) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            CLIENT_IP,
            $ipGeo['country'] ?? '',
            $ipGeo['regionName'] ?? '',
            $ipGeo['city'] ?? '',
            $ipGeo['timezone'] ?? '',
            CLIENT_TYPE,
            STATS_STRUCTURE,
            REFERER,
            USER_AGENT,
            PARENT_REFERER,
            $currentDatetime
        ]);
        $visit_id = DB->lastInsertId();
        $stmt = DB->prepare("INSERT INTO stats_visits_details (visit_id, date, counters) VALUES(?, ?, ?)");
        $stmt->execute([$visit_id, $currentDate, json_encode([$currentHour => 1])]);
    }
}
