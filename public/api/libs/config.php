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

/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
 */

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

setlocale(LC_ALL, 'fr_FR.UTF-8');
date_default_timezone_set('Europe/Paris');

$httpHost = $_SERVER['HTTP_HOST'];
$hostIsAllowed = in_array(true, array_map(fn($allowedHost) => stripos($httpHost, $allowedHost, 0) !== false, [
    'localhost',
    '127.0.0.1',
    'www.tiquettes.fr'
]));
if (!$hostIsAllowed) {
    header("HTTP/1.1 401 Unauthorized");
    exit(0);
}

$dbpath = __DIR__ . '/../tiquettes.db';
$pdo = new PDO('sqlite:' . $dbpath);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
define('DB', $pdo);

define('JWT_SECRET_KEY', '154ba2c38d864dd44f9ef20ced9deaa932e84df8bda3dde95c1ed7565150de29a23926ac6f5f13e41133d35973eae17e909542fe8ad905d1b38b023b37f613fe25447eee8b1fbecc61562f99b4eb631d7e73ce65ce5826b1bbe4186e673cd253543ae7a12e1c80b34df7902fa2ab26d6916c051af1f6a229a2e3dabdba9195d067ca7c856127bb03f9ccbd5d6eb72e69405ce1fe4686face249edc64b4ad67885fa4d6430e4efa215f76677fae161bbb2cc2dedf60a6ce86c7168c6ec276e9d5e34b9b6a9c6847ec31b7a55f26b4531fcef99e145902cd696c308cf0cea37d90dbd9432e6288bb26ebb9b0df092ee3f97479faa28dc957cdaef17e0f9f680d94');

function dd_json($content) {
    die(json_encode($content));
}

function write_json($content) {
    echo json_encode($content);
    exit;
}