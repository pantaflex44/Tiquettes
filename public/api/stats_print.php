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
    //header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

require_once('./libs/config.php');

if (!isset($_GET['type'])) {
    header("HTTP/1.1 400 Bad Request");
    exit;
}

$type = strtolower(trim($_GET['type']));
if ($type !== 'pdf' && $type !== 'std') {
    header("HTTP/1.1 400 Bad Request");
    exit;
}

$date = date('Y-m-d');

$stmt = DB->prepare("SELECT * FROM stats_print WHERE date = :date");
$stmt->execute([':date' => $date]);
$found = $stmt->fetch(\PDO::FETCH_ASSOC);

$pdf = is_array($found) && isset($found['pdf']) ? $found['pdf'] : 0;
$std = is_array($found) && isset($found['std']) ? $found['std'] : 0;
if ($type === 'pdf') $pdf++;
elseif ($type === 'std') $std++;

$stmt = DB->prepare("INSERT OR REPLACE INTO stats_print (date, pdf, std) VALUES(:date, :pdf, :std)");
$stmt->execute([':date' => $date, ':pdf' => $pdf, ':std' => $std]);