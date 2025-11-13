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

header('Content-type: application/json');

$function = filter_input(INPUT_GET, 'function', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$allowedFunctions = [
    'checkEmail',
];
$filepath = './auth/' . $function . '.php';
if ($function === false || !in_array($function, $allowedFunctions, true) || !file_exists($filepath)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Fonction non reconnue',
        'function' => $function,
    ]);
    exit;
}

require_once($filepath);

