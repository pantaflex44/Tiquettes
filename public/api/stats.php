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

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');
    header("Access-Control-Allow-Methods: GET, OPTIONS");
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET'
    || (stripos($_SERVER['HTTP_HOST'], 'localhost') === false
        && stripos($_SERVER['HTTP_HOST'], '127.0.0.1') === false
        && stripos($_SERVER['HTTP_HOST'], 'tiquettes.fr') === false)
) {
    header("HTTP/1.1 401 Unauthorized");
    exit(0);
}

require_once('./libs/config.php');

$date = date('Y-m-d');
$archiveDelay = '3 years';

$stmt = DB->prepare("DELETE FROM stats WHERE date < date('now','-{$archiveDelay}')");
$stmt->execute();

$stmt = DB->prepare("SELECT * FROM stats WHERE date = ?");
$stmt->execute([$date]);
$statsData = $stmt->fetch(\PDO::FETCH_ASSOC);

if (!is_array($statsData)) {
    $statsData = [];
    $stmt = DB->prepare("PRAGMA table_info('stats')");
    $stmt->execute();
    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        if ($row['name'] === 'date') continue;
        $statsData[$row['name']] = $row['dflt_value'] ?? null;
    }
    $statsData['date'] = $date;
}

function stats_by_type($type)
{
    global $statsData;

    if (isset($statsData[$type]) && $type !== 'date') {
        if (str_starts_with($type, 'count_')) {
            $statsData[$type] = intval($statsData[$type] ?? '0') + 1;
        }
    }

    $keys = join(',', array_keys($statsData));
    $tokens = join(',', array_fill(0, count($statsData), '?'));
    $values = array_values($statsData);
    $stmt = DB->prepare("INSERT OR REPLACE INTO stats ({$keys}) VALUES({$tokens})");
    $stmt->execute($values);
}

function stats_by_json($type, $key, $params = [])
{
    global $statsData;

    if (isset($statsData[$type]) && $type !== 'date') {
        if (str_starts_with($type, 'count_') && !is_null($key)) {
            $json = json_decode($statsData[$type], true);
            if (is_null($json)) $json = [];
            if (!array_key_exists($key, $json)) $json[$key] = ['title' => $params['title'] ?? $key, 'count' => 0];
            $json[$key]['count'] = intval($json[$key]['count'] ?? '0') + 1;
            $encoded = json_encode($json);
            if (is_string($encoded) && $encoded !== '') {
                $statsData[$type] = $encoded;
            }
        }
    }

    $keys = join(',', array_keys($statsData));
    $tokens = join(',', array_fill(0, count($statsData), '?'));
    $values = array_values($statsData);
    $stmt = DB->prepare("INSERT OR REPLACE INTO stats ({$keys}) VALUES({$tokens})");
    $stmt->execute($values);
}

$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : null;
if (!is_null($type)) {
    if (isset($_GET['key'])) {
        $key_decoded = base64_decode($_GET['key']);
        $key = json_decode($key_decoded, true);
        if (is_array($key) && isset($key['name']) && isset($key['title'])) {
            $k = base64_encode($key['name'] . "|" . $key['title']);
            stats_by_json($type, $k, ['title' => $key['title']]);
        }
    } else {
        stats_by_type($type);
    }
}