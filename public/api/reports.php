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

$stats = [];
$stats['period'] = $periodDetails;
$stats['structs'] = [];

foreach (explode(',', STATS_ALLOWED_FROM) as $struct) {
    if (!isset($stats[$struct]))
        $stats['structs'][$struct] = [];

    $stmt = DB->prepare("SELECT * FROM stats_visits WHERE type = 'user' AND struct = ? AND datetime >= ?");
    $stmt->execute([$struct, (clone NOW)->add(\DateInterval::createFromDateString('-15 minutes'))->format('Y-m-d H:i:s')]);
    $founds = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    $stats['structs'][$struct]['online'] = count($founds);

    $stmt = DB->prepare("SELECT * FROM stats_visits_details WHERE date >= ? AND date <= ? ORDER BY date ASC");
    $stmt->execute([$periodDetails['start']->format('Y-m-d'), $periodDetails['end']->format('Y-m-d')]);
    $founds = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    $stats['structs'][$struct]['visits'] = [];
    foreach ($founds as $found) {
        $date = $found['date'];
        $id = $found['visit_id'];
        $counters = json_decode($found['counters'], true);

        $stmt = DB->prepare("SELECT * FROM stats_visits WHERE id = ?");
        $stmt->execute([$id]);
        $found2 = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!is_array($found2) || $found2['struct'] !== $struct)
            continue;

        $url = $found2['url'];
        $ip = $found2['ip'];
        $type = $found2['type'];

        $counter = array_sum(array_values($counters));

        if (!isset($stats['structs'][$struct]['visits']['by_url'][$url]['total']))
            $stats['structs'][$struct]['visits']['by_url'][$url]['total'] = 0;
        $stats['structs'][$struct]['visits']['by_url'][$url]['total'] += $counter;

        if (!isset($stats['structs'][$struct]['visits']['by_url'][$url][$date]))
            $stats['structs'][$struct]['visits']['by_url'][$url][$date] = 0;
        $stats['structs'][$struct]['visits']['by_url'][$url][$date] += $counter;

        if (!isset($stats['structs'][$struct]['visits']['by_ip'][$ip]['total']))
            $stats['structs'][$struct]['visits']['by_ip'][$ip]['total'] = 0;
        $stats['structs'][$struct]['visits']['by_ip'][$ip]['total'] += $counter;

        if (!isset($stats['structs'][$struct]['visits']['by_ip'][$ip][$date]))
            $stats['structs'][$struct]['visits']['by_ip'][$ip][$date] = 0;
        $stats['structs'][$struct]['visits']['by_ip'][$ip][$date] += $counter;

        if (!isset($stats['structs'][$struct]['visits']['by_type'][$type]['total']))
            $stats['structs'][$struct]['visits']['by_type'][$type]['total'] = 0;
        $stats['structs'][$struct]['visits']['by_type'][$type]['total'] += $counter;

        if (!isset($stats['structs'][$struct]['visits']['by_type'][$type][$date]))
            $stats['structs'][$struct]['visits']['by_type'][$type][$date] = 0;
        $stats['structs'][$struct]['visits']['by_type'][$type][$date] += $counter;
        
    }
    
}





header('Content-type: application/json');
echo json_encode($stats);