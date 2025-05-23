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

require_once('./stats.php');

$ip = $_SERVER['HTTP_CLIENT_IP'] ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR']);

$firstTime = true;
$knownUser = false;

$stmt = DB->prepare("SELECT * FROM visits WHERE ip = ?");
$stmt->execute([$ip]);
$found = $stmt->fetch(\PDO::FETCH_ASSOC);
if (is_array($found) && count($found) > 0) {
    $firstTime = false;

    $now = new \DateTime('now', new \DateTimeZone('UTC'));
    $date = new \DateTime($found['lastvisit'], new \DateTimeZone('UTC'));
    $modified = (clone $date)->add(new \DateInterval("PT2H"));

    if ($modified < $now) {
        $knownUser = true;

        $stmt = DB->prepare("UPDATE visits SET lastvisit = datetime('now') WHERE ip = ?");
        $stmt->execute([$ip]);
    }
} else {
    $stmt = DB->prepare("INSERT INTO visits (ip, lastvisit) VALUES(?, datetime('now'))");
    $stmt->execute([$ip]);
}

$stats = [];
if ($firstTime) $stats[] = 'count_firstvisit';
if ($knownUser) $stats[] = 'count_knownusers';

$url = dirname((empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]");

foreach ($stats as $type) stats_by_type($type);