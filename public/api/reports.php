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

$periods = [
    '-1d' => ['start' => dateTimeFrom('yesterday'), 'end' => dateTimeFrom('yesterday'), 'text' => "Hier"],
    'd' => ['start' => dateTimeFrom('today'), 'end' => dateTimeFrom('today'), 'text' => "Aujourd'hui"],
    '-7d' => ['start' => dateTimeFrom('today -7 days'), 'end' => dateTimeFrom('today'), 'text' => "7 derniers jours"],
    'w' => ['start' => dateTimeFrom('Monday this week'), 'end' => dateTimeFrom('Sunday this week'), 'text' => "Cette semaine"],
    '-w' => ['start' => dateTimeFrom('Monday last week'), 'end' => dateTimeFrom('Sunday last week'), 'text' => "La semaine dernière"],
    '-30d' => ['start' => dateTimeFrom('today -30 days'), 'end' => dateTimeFrom('today'), 'text' => "30 derniers jours"],
    '-60d' => ['start' => dateTimeFrom('today -60 days'), 'end' => dateTimeFrom('today'), 'text' => "60 derniers jours"],
    '-90d' => ['start' => dateTimeFrom('today -90 days'), 'end' => dateTimeFrom('today'), 'text' => "90 derniers jours"],
    'm' => ['start' => dateTimeFrom('first day of this month'), 'end' => dateTimeFrom(from: 'last day of this month'), 'text' => "Ce mois ci"],
    '-m' => ['start' => dateTimeFrom('first day of last month'), 'end' => dateTimeFrom(from: 'last day of last month'), 'text' => "Le mois dernier"],
    'y' => ['start' => dateTimeFrom('first day of this year'), 'end' => dateTimeFrom(from: 'last day of this year'), 'text' => "Cette année"],
    '-y' => ['start' => dateTimeFrom('first day of last year'), 'end' => dateTimeFrom(from: 'last day of last year'), 'text' => "L'année dernière"],
];

$period = isset($_GET['p']) ? strtolower(trim($_GET['p'])) : '-30d';
if (!isset($periods[$period]))
    $period = '-30d';
$periodDetails = $periods[$period];

$currentDate = NOW->format('Y-m-d');
$currentDatetime = NOW->format('Y-m-d H:i:s');

$resolution = isset($_GET['rs']) ? strtolower(trim($_GET['rs'])) : 'd'; // d: jours , h: heures

$stats = [
    'datetime' => NOW,
    'period' => $periodDetails,
    'defn' => [],
    'visits' => [],
    'actions' => [],
];

function sourceTraductor(string $source): string
{
    $srcs = [
        'chatgpt' => 'ChatGPT',
        'google' => 'Google',
        'yahoo' => 'Yahoo',
        'bing' => 'Microsoft Bing',
        'carrot2' => 'Carrot2',
        'duckduckgo' => 'DuckDuckGo',
        'iseek' => 'iSeek',
        'qwant' => 'Qwant',
        'startpage' => 'Startpage',
        'base-search' => 'Base',
        'instagrok' => 'Instagrok',
        'openmd' => 'OpenMD',
        'refseek' => 'RefSeek',
        'researchgate' => 'ResearchGate',
        'baidu' => 'Baïdu',
        'yandex' => 'Yandex'
    ];

    foreach (array_keys($srcs) as $s) {
        if (stripos(strtolower($source), $s) !== false)
            return $srcs[$s];
    }

    return $source;
}

function browserTraductor(string $browser): string
{
    $srcs = [
        'opera' => 'Opera',
        'firefox' => 'Mozilla Firefox',
        'msie' => 'Microsoft Internet Explorer',
        'safari' => 'Apple Safari',
        'netscape' => 'Netscape',
        'edge' => 'Microsoft Edge',
        'trident' => 'Microsoft Internet Explorer',
        'chrome' => 'Google Chrome'
    ];

    foreach (array_keys($srcs) as $s) {
        if (stripos(strtolower($browser), $s) !== false) {
            $txt = $srcs[$s];
            $isMobile = stripos(strtolower($browser), 'mobile') !== false;
            $isAndroid = stripos(strtolower($browser), 'android') !== false;

            if ($isAndroid)
                $txt .= ' Android';
            if ($isMobile)
                $txt .= ' Mobile';

            return $txt;
        }
    }

    return $browser;
}

function platformTraductor(string $platform): string
{
    $srcs = [
        'win32' => 'Microsoft Windows (32 bits)',
        'win64' => 'Microsoft Windows (64 bits)',
        'win10' => 'Microsoft Windows (10)',
        'windows' => 'Microsoft Windows',
        'linux' => 'Linux',
        'mac os x' => 'Apple Mac OS (X)',
        'mac os' => 'Apple Mac OS',
        'macintosh' => 'Apple Mac OS'
    ];

    foreach (array_keys($srcs) as $s) {
        if (stripos(strtolower($platform), $s) !== false)
            return $srcs[$s];
    }

    return $platform;
}

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

        $url = $found2['url'];
        $ip = $found2['ip'];
        $type = $found2['type'];

        if ($found2['ua'] !== '') {
            $ua = get_browser($found2['ua'], true);
            if ($ua !== false) {
                $browser = browserTraductor($ua['browser']);
                if (!isset($stats['visits']['browser'][$browser]))
                    $stats['visits']['browser'][$browser] = 0;
                $stats['visits']['browser'][$browser] += 1;

                $platform = platformTraductor($ua['platform']);
                if (!isset($stats['visits']['platform'][$platform]))
                    $stats['visits']['platform'][$platform] = 0;
                $stats['visits']['platform'][$platform] += 1;
            }
        }

        $query = parse_url($url, PHP_URL_QUERY);
        if (is_string($query)) {
            $urlQuery = explode('&', $query);
            foreach ($urlQuery as $query) {
                $query = trim($query);
                if (stripos(strtolower($query), 'source=') !== false) {
                    $parsed = explode('=', $query);
                    $source = sourceTraductor(strtolower($parsed[1]));
                    if (!isset($stats['visits']['sources'][$source]))
                        $stats['visits']['sources'][$source] = 0;
                    $stats['visits']['sources'][$source] += 1;
                }
            }
        }

        if ($found2['rfr'] !== '') {
            $rfr = $found2['rfr'];
            if (stripos(strtolower($rfr), 'tiquettes.fr') === false) {
                $rfr = sourceTraductor($rfr);
                if (!isset($stats['visits']['sources'][$rfr]))
                    $stats['visits']['sources'][$rfr] = 0;
                $stats['visits']['sources'][$rfr] += 1;
            }
        }

        $counter = array_sum(array_values($counters));

        if (!isset($stats['visits'][$structItem['key']]['total']))
            $stats['visits'][$structItem['key']]['total'] = 0;
        $stats['visits'][$structItem['key']]['total'] += $counter;

        if (!isset($stats['visits'][$structItem['key']]['by_url'][$url]['total']))
            $stats['visits'][$structItem['key']]['by_url'][$url]['total'] = 0;
        $stats['visits'][$structItem['key']]['by_url'][$url]['total'] += $counter;

        if (!isset($stats['visits'][$structItem['key']]['by_url'][$url][$date]))
            $stats['visits'][$structItem['key']]['by_url'][$url][$date] = 0;
        $stats['visits'][$structItem['key']]['by_url'][$url][$date] += $counter;


        if (!isset($stats['visits'][$structItem['key']]['by_ip'][$ip]['total']))
            $stats['visits'][$structItem['key']]['by_ip'][$ip]['total'] = 0;
        $stats['visits'][$structItem['key']]['by_ip'][$ip]['total'] += $counter;

        if (!isset($stats['visits'][$structItem['key']]['by_ip'][$ip][$date]))
            $stats['visits'][$structItem['key']]['by_ip'][$ip][$date] = 0;
        $stats['visits'][$structItem['key']]['by_ip'][$ip][$date] += $counter;

        $stats['visits'][$structItem['key']]['by_ip'][$ip]['geo'] = "http://ip-api.com/json/" . $ip;


        if (!isset($stats['visits'][$structItem['key']]['by_type'][$type]['total']))
            $stats['visits'][$structItem['key']]['by_type'][$type]['total'] = 0;
        $stats['visits'][$structItem['key']]['by_type'][$type]['total'] += $counter;

        if (!isset($stats['visits'][$structItem['key']]['by_type'][$type][$date]))
            $stats['visits'][$structItem['key']]['by_type'][$type][$date] = 0;
        $stats['visits'][$structItem['key']]['by_type'][$type][$date] += $counter;

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

                if (!isset($stats['actions'][$actionItem['key']][$date]))
                    $stats['actions'][$actionItem['key']][$date] = 0;
                $stats['actions'][$actionItem['key']][$date] += $counter;
            }
        }
    }

}





header('Content-type: application/json');
echo json_encode($stats);