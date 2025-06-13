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

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once(__DIR__ . '/libs/config.php');
require_once(__DIR__ . '/libs/php-jwt-main/src/JWT.php');
require_once(__DIR__ . '/libs/php-jwt-main/src/Key.php');


function generateUUID(): string
{
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0C2f) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0x2Aff), mt_rand(0, 0xffD3), mt_rand(0, 0xff4B)
    );
}

function getAuthorizationHeader(): string|false
{
    $headers = false;

    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        //print_r($requestHeaders);
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    return $headers;
}

function generateToken(int $id, bool $withBearer = false, string $domainName = "www.tiquettes.fr", string $expiration = '+1 week'): array
{
    $stmt = DB->prepare("SELECT COUNT(*) AS count FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $count = $stmt->fetch(\PDO::FETCH_COLUMN);
    if (!$count || $count !== 1) return false;

    $uuid = generateUUID();
    $date = new \DateTimeImmutable();
    $now = $date->getTimestamp();
    $expireAt = $date->modify($expiration)->getTimestamp();
    $refreshBefore = $date->modify('+1 month')->getTimestamp();
    $requestData = [
        'iat' => $now,
        'iss' => $domainName,
        'nbf' => $now,
        'exp' => $expireAt,
        'userId' => $id,
        'uuid' => $uuid
    ];
    $token = JWT::encode(
        $requestData,
        JWT_SECRET_KEY,
        'HS512'
    );
    if ($withBearer) $token = "Bearer {$token}";

    $stmt = DB->prepare("UPDATE users SET uuid = ?, uuid_expire = ?, uuid_refresh = ? WHERE id = ?");
    $stmt->execute([$uuid, $expireAt, $refreshBefore, $id]);

    return [$token, $expireAt];
}

function getToken(string $domainName = "www.tiquettes.fr"): stdClass
{
    $authorizationHeader = getAuthorizationHeader();

    if (!preg_match('/Bearer\s(\S+)/', $authorizationHeader, $matches)) {
        header('HTTP/1.0 400 Bad Request');
        echo 'Token not found in request';
        exit;
    }

    $jwt = $matches[1];
    if (!$jwt) {
        header('HTTP/1.0 400 Bad Request');
        echo 'Malformed token';
        exit;
    }

    try {
        $token = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS512'));
    } catch (Exception $e) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    $now = new \DateTimeImmutable();
    if ($token->iss !== $domainName ||
        $token->nbf > $now->getTimestamp() ||
        $token->exp < $now->getTimestamp()) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    return $token;
}

function getCurrentUser(string $domainName = "www.tiquettes.fr"): array
{
    $token = getToken($domainName);

    $stmt = DB->prepare("SELECT * FROM users WHERE id = ? AND uuid = ?");
    $stmt->execute([$token->userId, $token->uuid]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$user) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    $now = new \DateTimeImmutable();
    if ($user['uuid_expire'] < $now->getTimestamp() || $user['uuid_refresh'] < $now->getTimestamp()) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    return $user;
}

function emailExists(string $email): bool
{
    $stmt = DB->prepare("SELECT COUNT(*) AS count FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $count = $stmt->fetch(\PDO::FETCH_COLUMN);

    return $count === 1;
}

function displayNameExists(string $displayName): bool
{
    $stmt = DB->prepare("SELECT COUNT(*) AS count FROM users WHERE display_name = ?");
    $stmt->execute([$displayName]);
    $count = $stmt->fetch(\PDO::FETCH_COLUMN);

    return $count === 1;
}

function getUserById(int $id): array|null
{
    $stmt = DB->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$user) return null;

    return $user;
}

function authenticate(string $domainName = "www.tiquettes.fr"): array
{
    $user = getCurrentUser($domainName);

    $stmt = DB->prepare("UPDATE users SET last_authentificate = datetime('now') WHERE id = ?");
    $stmt->execute([$user['id']]);

    return $user;
}

function refreshToken(string $domainName = "www.tiquettes.fr"): array
{
    $user = getCurrentUser($domainName);

    return generateToken($user['id']);
}

header('Content-Type: application/json');

$action = isset($_GET['action']) ? trim($_GET['action']) : '';
switch ($action) {
    case 'login':
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $password = isset($_POST['password']) ? trim($_POST['password']) : '';
        if ($email === '' || $password === '') {
            write_json([
                'errors' => [
                    'email' => "Adresse email requise",
                    'password' => "Mot de passe requis",
                ]
            ]);
        }
        $stmt = DB->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$user) {
            write_json([
                'errors' => [
                    'email' => "Adresse email ou mot de passe incorrect",
                ]
            ]);
        }
        if (password_verify($password, $user['password'])) {
            if ($user['active'] !== 1) {
                write_json([
                    'errors' => [
                        'email' => "Ce compte utilisateur est désactivé !",
                    ]
                ]);
            }

            $stmt = DB->prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?");
            $stmt->execute([$user['id']]);
            [$token, $expireAt] = generateToken($user['id']);

            unset($user['password']);

            write_json([
                'token' => $token,
                'expireAt' => $expireAt,
                'user' => $user,
            ]);
        }
        write_json([
            'errors' => [
                'email' => "Adresse email ou mot de passe incorrect",
            ]
        ]);

    case 'logout':
        $user = getCurrentUser();
        $stmt = DB->prepare("UPDATE users SET uuid = '', uuid_expire = 0, uuid_refresh = 0 WHERE id = ?");
        $stmt->execute([$user['id']]);
        write_json([]);

    case 'register':
        $email = isset($_POST['email']) ? strtolower(trim($_POST['email'])) : '';
        $password = isset($_POST['password']) ? trim($_POST['password']) : '';
        $repassword = isset($_POST['repassword']) ? trim($_POST['repassword']) : '';
        if ($email === '' || $password === '') {
            write_json([
                'errors' => [
                    'email' => "Adresse email requise",
                    'password' => "Mot de passe requis",
                ]
            ]);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            write_json([
                'errors' => [
                    'email' => "Format de l'adresse email incorrect",
                ]
            ]);
        }
        $stmt = DB->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if ($user) {
            write_json([
                'errors' => [
                    'email' => "Un compte existe déja avec cette adresse email",
                ]
            ]);
        }
        $passwordRegex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/';
        if (!preg_match($passwordRegex, $password)) {
            write_json([
                'errors' => [
                    'password' => "Mot de passe incorrect. Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial : #?!@$%^&*-",
                ]
            ]);
        }
        if ($password !== $repassword) {
            write_json([
                'errors' => [
                    'repassword' => "Confirmation du mot de passe incorrecte",
                ]
            ]);
        }
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = DB->prepare("INSERT INTO users (email, password, display_name, created) VALUES(?, ?, ?, datetime('now'))");
        $stmt->execute([$email, $password_hash, $email]);
        $id = DB->lastInsertId();
        [$token, $expireAt] = generateToken($id);

        $user = getUserById($id);
        if (is_null($user)) {
            write_json([
                'errors' => [
                    'main' => "Une erreur s'est produite lors de l'enregistrement",
                ]
            ]);
        }
        unset($user['password']);

        write_json([
            'token' => $token,
            'expireAt' => $expireAt,
            'user' => $user,
        ]);

    case 'refresh':
        $ret = refreshToken();
        write_json([
            'token' => $ret['token'],
            'expireAt' => $ret['expireAt'],
        ]);

    case 'authenticate':
        $user = authenticate();
        unset($user['password']);
        header('Content-Type: application/json');
        write_json($user);

    case 'emailExists':
        $email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';
        $exists = $email !== '' && emailExists($email);
        header('Content-Type: application/json');
        write_json([
            'exists' => $exists,
            'email' => $email,
        ]);

    case 'displayNameExists':
        $displayName = isset($_GET['displayName']) ? strtolower(trim($_GET['displayName'])) : '';
        $exists = $displayName !== '' && displayNameExists($displayName);
        header('Content-Type: application/json');
        write_json([
            'exists' => $exists,
            'displayName' => $displayName,
        ]);
}
