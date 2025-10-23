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

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer-master/src/Exception.php';
require __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/src/SMTP.php';


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('MYIP_NORETURN', true);
require_once __DIR__ . '/../myip.php';

function dd_json(mixed $content): void
{
    header('Content-Type: application/json');
    write_json([
        'errors' => $content,
    ]);
}

function write_json(mixed $content): void
{
    echo json_encode($content);
    exit;
}

function send_Mail(array|string $to, string $subject, string $body): bool
{
    $mail = new PHPMailer(true);
    try {
        $mail->setLanguage('fr');
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isSMTP();
        $mail->isHTML(true);

        if (defined('SMTP_DEBUG'))
            $mail->SMTPDebug = SMTP_DEBUG;
        if (defined('SMTP_HOST'))
            $mail->Host = SMTP_HOST;
        if (defined('SMTP_AUTH'))
            $mail->SMTPAuth = SMTP_AUTH;
        if (defined('SMTP_USERNAME'))
            $mail->Username = SMTP_USERNAME;
        if (defined('SMTP_PASSWORD'))
            $mail->Password = SMTP_PASSWORD;
        if (defined('SMTP_SECURE'))
            $mail->SMTPSecure = SMTP_SECURE;
        if (defined('SMTP_PORT'))
            $mail->Port = SMTP_PORT;
        if (defined('SMTP_FROM')) {
            if (is_array(SMTP_FROM) && count(SMTP_FROM) === 2) {
                $mail->setFrom(SMTP_FROM[0], SMTP_FROM[1]);
                $mail->addReplyTo(SMTP_FROM[0], SMTP_FROM[1]);
            } else if (is_string(SMTP_FROM)) {
                $mail->setFrom(SMTP_FROM[0], SMTP_FROM[1]);
                $mail->addReplyTo(SMTP_FROM[0], SMTP_FROM[1]);
            }
        }
        if (is_array($to) && count($to) === 2) {
            $mail->addAddress($to[0], $to[1]);
        } else if (is_string($to)) {
            $mail->addAddress($to);
        }

        $mail->Subject = (defined('SMTP_SUBJECT_PREFIX') ? SMTP_SUBJECT_PREFIX : '') . $subject;
        $mail->Body = $body;
        $mail->AltBody = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        // $mail->ErrorInfo
        dd_json($mail->ErrorInfo);
        return false;
    }
}



// mode
const DEFAULT_MODE = 'development';
define('MODE', isset($_GET['m']) ? trim(rawurldecode($_GET['m'])) : DEFAULT_MODE);
include_once __DIR__ . '/constants.' . MODE . '.php';


// cors
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    header("Access-Control-Max-Age: 1728000");
    header("Content-Length: 0");
    header("Content-Type: text/plain");
    exit(0);
}
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");


// datetime
define('LOCALE', 'fr_FR.UTF-8');
setlocale(LC_ALL, LOCALE);
define('TIMEZONE', 'Europe/Paris');
date_default_timezone_set(TIMEZONE);
define('NOW', (new \DateTime('now', new \DateTimeZone('UTC'))));
define('NOW_TIMESTAMP', NOW->getTimestamp());


// referer
$rfr = isset($_GET['rfr']) ? stripslashes(trim(rawurldecode($_GET['rfr']))) : ($_SERVER['HTTP_REFERER'] ?? $_SERVER['HTTP_HOST'] ?? '');
define('REFERER', $rfr);
if (MODE !== 'development') {
    $hostIsAllowed = in_array(true, array_map(fn($allowedHost) => stripos(REFERER, $allowedHost, 0) !== false, [
        'localhost',
        '127.0.0.1',
        'www.tiquettes.fr'
    ]));
    if (!$hostIsAllowed) {
        header("HTTP/1.1 401 Unauthorized");
        exit(0);
    }
}


// parent referer
$prt = trim(isset($_GET['prt']) ? stripslashes(trim(rawurldecode($_GET['prt']))) : '');
if (stripos(strtolower($prt), 'tiquettes.fr') !== false)
    $prt = '';
define('PARENT_REFERER', $prt);


// client infos
$ip = isset($_GET['ip']) ? trim(rawurldecode($_GET['ip'])) : '';
if (!filter_var($ip, FILTER_VALIDATE_IP))
    $ip = getRealUserIp();
define('CLIENT_IP', $ip);
define('CLIENT_TYPE', isBot() ? 'bot' : 'user');
define('CLIENT_FROM_LOCALHOST', CLIENT_IP === '127.0.0.1' || CLIENT_IP === '::1');


// user agent
$ua = trim(isset($_GET['ua']) ? trim(rawurldecode($_GET['ua'])) : (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : ''));
define('USER_AGENT', $ua);


// database
try {
    $pdo = new PDO("mysql:host=" . MYSQL_HOST . ";port=" . MYSQL_PORT . ";dbname=" . MYSQL_BASE, MYSQL_USER, MYSQL_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    define('DB', $pdo);
} catch (PDOException $e) {
    dd_json(content: $e);
    exit(0);
}
