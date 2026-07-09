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

declare(strict_types=1);

function SQL2DateTimeUTC(string $sqlDate, string $format = 'Y-m-d H:i:s'): \DateTime
{
    return \DateTime::createFromFormat($format, $sqlDate, new \DateTimeZone('UTC'));
}

function addToDateTime(\DateTime $dt, string $intervalString, bool $isClone = true): \DateTime
{
    return (clone $dt)->add(\DateInterval::createFromDateString($intervalString));
}

function dateTimeFrom(string $from): \DateTime
{
    return new \DateTime($from, new \DateTimeZone("UTC"));
}



$mode = htmlspecialchars(isset($_GET['m']) ? $_GET['m'] : '');
if (!in_array($mode, ['production', 'development']))
    exit();
