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



$period = isset($_GET['p']) ? strtolower(trim($_GET['p'])) : '-30d';
if (!isset(STATS_ALLOWED_PERIODS[$period]))
    $period = '-30d';
$periodDetails = array_merge([
    'key' => $period,
], STATS_ALLOWED_PERIODS[$period]);


$currentDate = NOW->format('Y-m-d');
$currentDatetime = NOW->format('Y-m-d H:i:s');

$resolution = isset($_GET['rs']) ? strtolower(trim($_GET['rs'])) : 'd'; // d: jours , h: heures
if (!isset(STATS_ALLOWED_RESOLUTIONS[$resolution]))
    $resolution = 'd';
$resolutionDetails = [
    'key' => $resolution,
    'text' => STATS_ALLOWED_RESOLUTIONS[$resolution]['text']
];



$stats = [
    'datetime' => NOW,
    'period' => $periodDetails,
    'resolution' => $resolutionDetails,
    'defn' => [
        'periods' => STATS_ALLOWED_PERIODS,
        'resolutions' => array_reduce(array_map(fn($k, $v) => [$k, $v['text']], array_keys(STATS_ALLOWED_RESOLUTIONS), array_values(STATS_ALLOWED_RESOLUTIONS)), function ($result, $item) {
            $result[$item[0]] = $item[1];
            return $result;
        }, []),
    ],
    'visits' => [],
    'actions' => [],
    'choices' => []
];




foreach (STATS_ALLOWED_STRUCTURES_FULL as $structItem) {
    $stats['defn']['structs'][$structItem['key']] = $structItem['description'];

    $stmt = DB->prepare("SELECT * FROM stats_visits_details WHERE date >= ? AND date <= ? ORDER BY date ASC");
    $stmt->execute([$periodDetails['start']->format(format: 'Y-m-d'), $periodDetails['end']->format('Y-m-d')]);
    $founds = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    foreach ($founds as $found) {
        $date = $found['date'];
        $id = $found['visit_id'];
        $counters = json_decode($found['counters'], true);

        $stmt = DB->prepare("SELECT * FROM stats_visits WHERE id = ?");
        $stmt->execute([$id]);
        $found2 = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!is_array($found2) || $found2['struct'] !== $structItem['key'])
            continue;

        $ua = trim($found2['ua'] ?? '');
        $rfr = trim($found2['rfr'] ?? '');
        $url = trim($found2['url'] ?? '');
        $ip = trim($found2['ip'] ?? '');
        $type = trim($found2['type'] ?? '');
        $country = trim($found2['country'] ?? '');
        $regionName = trim($found2['regionName'] ?? '');
        $city = trim($found2['city'] ?? '');
        $timezone = trim($found2['timezone'] ?? '');

        if ($ua !== '') {
            if (!isset($stats['visits'][$structItem['key']]['supports']['mobile']))
                $stats['visits'][$structItem['key']]['supports']['mobile'] = 0;
            if (!isset($stats['visits'][$structItem['key']]['supports']['desktop']))
                $stats['visits'][$structItem['key']]['supports']['desktop'] = 0;
            if (stripos(strtolower($ua), 'mobile') !== false || stripos(strtolower($ua), 'android') !== false) {
                $stats['visits'][$structItem['key']]['supports']['mobile'] += 1;
            } else {
                $stats['visits'][$structItem['key']]['supports']['desktop'] += 1;
            }

            $ua = get_browser($ua, true);
            if ($ua !== false) {
                $browser = browserTraductor($ua['browser']);
                if (!isset($stats['visits'][$structItem['key']]['browsers'][$browser]))
                    $stats['visits'][$structItem['key']]['browsers'][$browser] = 0;
                $stats['visits'][$structItem['key']]['browsers'][$browser] += 1;

                $platform = platformTraductor($ua['platform']);
                if (!isset($stats['visits'][$structItem['key']]['platforms'][$platform]))
                    $stats['visits'][$structItem['key']]['platforms'][$platform] = 0;
                $stats['visits'][$structItem['key']]['platforms'][$platform] += 1;
            }
        }

        $query = parse_url($url, PHP_URL_QUERY);
        if (is_string($query)) {
            $urlQuery = explode('&', $query);
            foreach ($urlQuery as $query) {
                $query = trim($query);
                if (stripos(strtolower($query), 'source=') !== false) {
                    $parsed = explode('=', $query);
                    $source = $parsed[1];
                    if (!isset($stats['visits'][$structItem['key']]['sources'][$source]))
                        $stats['visits'][$structItem['key']]['sources'][$source] = 0;
                    $stats['visits'][$structItem['key']]['sources'][$source] += 1;
                }
            }
        }

        if ($rfr !== '') {
            if (stripos(strtolower($rfr), 'tiquettes.fr') === false) {
                if (!isset($stats['visits'][$structItem['key']]['sources'][$rfr]))
                    $stats['visits'][$structItem['key']]['sources'][$rfr] = 0;
                $stats['visits'][$structItem['key']]['sources'][$rfr] += 1;
            }
        }

        $counter = array_sum(array_values($counters));

        if (!isset($stats['visits'][$structItem['key']]['total']))
            $stats['visits'][$structItem['key']]['total'] = 0;
        $stats['visits'][$structItem['key']]['total'] += $counter;

        foreach (['type', 'url', 'country', 'regionName', 'city', 'timezone'] as $k) {
            $value = trim($$k);
            if ($value === '')
                $value = 'Autres';

            if (!isset($stats['visits'][$structItem['key']][$k][$value]['total']))
                $stats['visits'][$structItem['key']][$k][$value]['total'] = 0;
            $stats['visits'][$structItem['key']][$k][$value]['total'] += $counter;

            if ($resolutionDetails['key'] === 'd') {
                $interval = \DateInterval::createFromDateString('1 day');
                $period = new \DatePeriod($periodDetails['start'], $interval, (clone $periodDetails['end'])->modify('+1 day'));
                foreach ($period as $dt) {
                    if (!isset($stats['visits'][$structItem['key']][$k][$value][$dt->format('Y-m-d')]))
                        $stats['visits'][$structItem['key']][$k][$value][$dt->format('Y-m-d')] = 0;
                }

                $stats['visits'][$structItem['key']][$k][$value][$date] += $counter;
            }

            if ($resolutionDetails['key'] === 'h') {
                for ($h = 0; $h <= 23; $h++) {
                    if (!isset($stats['visits'][$structItem['key']][$k][$value][$h]))
                        $stats['visits'][$structItem['key']][$k][$value][$h] = 0;
                }

                foreach ($counters as $hr => $cnt) {
                    $stats['visits'][$structItem['key']][$k][$value][$hr] += $cnt;
                }
            }
        }

    }

    foreach (STATS_ALLOWED_ACTIONS_FULL as $actionItem) {
        $stats['defn']['actions'][$actionItem['key']] = $actionItem['description'];

        $tableName = 'stats_action_' . $actionItem['key'];
        $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
        $stmt->execute([MYSQL_BASE, $tableName]);
        $count = $stmt->fetchColumn(0);
        if ($count === 1) {
            $stmt = DB->prepare("SELECT * FROM " . $tableName . " WHERE date >= ? AND date <= ? ORDER BY date ASC");
            $stmt->execute([$periodDetails['start']->format('Y-m-d'), $periodDetails['end']->format('Y-m-d')]);
            $founds = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($founds as $found) {
                $date = $found['date'];

                $counters = json_decode($found['counters'], true);
                $counter = array_sum(array_values($counters));

                if (!isset($stats['actions'][$actionItem['key']]['total']))
                    $stats['actions'][$actionItem['key']]['total'] = 0;
                $stats['actions'][$actionItem['key']]['total'] += $counter;

                if ($resolutionDetails['key'] === 'd') {
                    $interval = \DateInterval::createFromDateString('1 day');
                    $period = new \DatePeriod($periodDetails['start'], $interval, (clone $periodDetails['end'])->modify('+1 day'));
                    foreach ($period as $dt) {
                        if (!isset($stats['actions'][$actionItem['key']][$dt->format('Y-m-d')]))
                            $stats['actions'][$actionItem['key']][$dt->format('Y-m-d')] = 0;
                    }

                    $stats['actions'][$actionItem['key']][$date] += $counter;
                }

                if ($resolutionDetails['key'] === 'h') {
                    for ($h = 0; $h <= 23; $h++) {
                        if (!isset($stats['actions'][$actionItem['key']][$h]))
                            $stats['actions'][$actionItem['key']][$h] = 0;
                    }

                    foreach ($counters as $hr => $cnt) {
                        $stats['actions'][$actionItem['key']][$hr] += $cnt;
                    }
                }
            }
        }
    }

    foreach (STATS_ALLOWED_CHOICES_FULL as $choiceItem) {
        $stats['defn']['choices'][$choiceItem['key']] = $choiceItem['description'];

        $tableName = 'stats_choice_' . $choiceItem['key'];
        $stmt = DB->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
        $stmt->execute([MYSQL_BASE, $tableName]);
        $count = $stmt->fetchColumn(0);
        if ($count === 1) {
            $stmt = DB->prepare("SELECT * FROM " . $tableName . " WHERE struct = ? ORDER BY counter DESC");
            $stmt->execute([$structItem['key']]);
            $founds = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($founds as $found) {
                $stats['choices'][$structItem['key']][$choiceItem['key']][$found['name']] = $found['counter'];
            }
        }
    }

}





header('Content-type: application/json');

if (isset($_GET['defnask'])) {
    echo json_encode($stats['defn']);
} else {
    echo json_encode($stats);
}