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

function SQL2DateTimeUTC(string $sqlDate, string $format = 'Y-m-d H:i:s'): \DateTime
{
    return \DateTime::createFromFormat($format, $sqlDate, new \DateTimeZone('UTC'));
}

function addToDateTime(\DateTime $dt, string $intervalString, bool $isClone = true): \DateTime
{
    return (clone $dt)->add(\DateInterval::createFromDateString($intervalString));
}

function dateTimeFrom(string $from): \DateTime {
    return new \DateTime($from, new \DateTimeZone("UTC"));
}


define('STATS_ALLOWED', !STATS_IGNORE_LOCALHOST || (STATS_IGNORE_LOCALHOST && !CLIENT_FROM_LOCALHOST));

$stmt = DB->prepare("SELECT * FROM stats_allowed_structs");
$stmt->execute();
define('STATS_ALLOWED_STRUCTURES', array_map(fn($i) => $i['key'], $stmt->fetchAll(\PDO::FETCH_ASSOC)));
$statsStructure = isset($_GET['s']) ? strtolower(rawurldecode(trim($_GET['s']))) : '';
define('STATS_STRUCTURE_ALLOWED', in_array($statsStructure, STATS_ALLOWED_STRUCTURES));
define('STATS_STRUCTURE', STATS_STRUCTURE_ALLOWED ? $statsStructure : '');

$stmt = DB->prepare("SELECT * FROM stats_allowed_actions");
$stmt->execute();
define('STATS_ALLOWED_ACTIONS', array_map(fn($i) => $i['key'],$stmt->fetchAll(\PDO::FETCH_ASSOC)));
$statsAction = isset($_GET['a']) ? strtolower(rawurldecode(trim($_GET['a']))) : '';
define('STATS_ACTION_ALLOWED', in_array($statsAction, STATS_ALLOWED_ACTIONS, true));
define('STATS_ACTION', STATS_ACTION_ALLOWED ? $statsAction : '');


