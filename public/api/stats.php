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

    if (is_string($type) && $type !== '') $type = [$type];
    if (!is_array($type)) return;

    foreach ($type as $t) {
        if (isset($statsData[$t]) && $t !== 'date') {
            if (str_starts_with($t, 'count_')) {
                $statsData[$t] = intval($statsData[$t] ?? '0') + 1;
            }
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

    if (is_string($type) && $type !== '') $type = [$type];
    if (!is_array($type)) return;

    foreach ($type as $t) {
        if (isset($statsData[$t]) && $t !== 'date') {
            if (str_starts_with($t, 'count_') && !is_null($key)) {
                $json = json_decode($statsData[$t], true);
                if (is_null($json)) $json = [];
                if (!array_key_exists($key, $json)) $json[$key] = ['title' => $params['title'] ?? $key, 'count' => 0];
                $json[$key]['count'] = intval($json[$key]['count'] ?? '0') + 1;
                $encoded = json_encode($json);
                if (is_string($encoded) && $encoded !== '') {
                    $statsData[$t] = $encoded;
                }
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
if (is_string($type)) {
    $type = explode('|', $type);
    if (is_array($type) && count($type) > 0) {
        if (isset($_GET['key'])) {
            $key_decoded = base64_decode($_GET['key']);
            $key = json_decode($key_decoded, true);
            if (is_array($key) && isset($key['name']) && isset($key['title'])) {
                $k = base64_encode($key['name'] . "|" . $key['title']);
                stats_by_json($type[0], $k, ['title' => $key['title']]);
            }
        } else {
            stats_by_type($type);
        }
    }
}