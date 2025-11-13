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

$email = filter_input(INPUT_GET, 'email', FILTER_VALIDATE_EMAIL);
if (is_null($email) || $email === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Adresse email invalide',
    ]);
    exit;
}

$stmt = DB->prepare('SELECT id, email, displayName FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);
if ($result === false) {
    echo json_encode([
        'status' => 'ok',
        'exists' => false,
    ]);
    exit;
} else {
    echo json_encode([
        'status' => 'ok',
        'exists' => true,
        'user' => [
            'id' => (int)$result['id'],
            'email' => $result['email'],
            'displayName' => $result['displayName'],
        ],
    ]);
    exit;
}