<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;


const SMTP_DEBUG = SMTP::DEBUG_OFF;
const SMTP_HOST = 'smtp.mail.fr';
const SMTP_AUTH = true;
const SMTP_USERNAME = 'contact@mail.fr';
const SMTP_PASSWORD = 'mot_de_PassE';
const SMTP_SECURE = PHPMailer::ENCRYPTION_SMTPS;
const SMTP_PORT = 465;
const SMTP_FROM = ['contact@mail.fr', 'Moi'];
const SMTP_SUBJECT_PREFIX = "Moi - ";

const MYSQL_HOST = "localhost";
const MYSQL_PORT = 3306;
const MYSQL_USER = "root";
const MYSQL_PASS = "";
const MYSQL_BASE = "tiquettes";

const STATS_IGNORE_LOCALHOST = false;
const STATS_VISITS_INTERVAL = '15 minutes';
