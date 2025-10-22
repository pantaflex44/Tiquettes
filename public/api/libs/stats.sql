-- Adminer 5.4.1 MariaDB 10.11.13-MariaDB-0ubuntu0.24.04.1 dump

SET NAMES utf8;

SET time_zone = '+00:00';

SET foreign_key_checks = 0;

SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `stats_action_create`;

CREATE TABLE `stats_action_create` (
    `date` date NOT NULL DEFAULT current_timestamp(),
    `struct` varchar(10) NOT NULL,
    `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`)),
    PRIMARY KEY (`date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

DROP TABLE IF EXISTS `stats_action_export`;

CREATE TABLE `stats_action_export` (
    `date` date NOT NULL DEFAULT current_timestamp(),
    `struct` varchar(10) NOT NULL,
    `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`)),
    PRIMARY KEY (`date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

DROP TABLE IF EXISTS `stats_action_import`;

CREATE TABLE `stats_action_import` (
    `date` date NOT NULL DEFAULT current_timestamp(),
    `struct` varchar(10) NOT NULL,
    `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`)),
    PRIMARY KEY (`date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

DROP TABLE IF EXISTS `stats_action_print`;

CREATE TABLE `stats_action_print` (
    `date` date NOT NULL DEFAULT current_timestamp(),
    `struct` varchar(10) NOT NULL,
    `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`)),
    PRIMARY KEY (`date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

DROP TABLE IF EXISTS `stats_allowed_actions`;

CREATE TABLE `stats_allowed_actions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `key` varchar(10) NOT NULL,
    `description` text NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

TRUNCATE `stats_allowed_actions`;

INSERT INTO
    `stats_allowed_actions` (`id`, `key`, `description`)
VALUES (
        1,
        'create',
        'Création d\'un nouveau projet'
    ),
    (
        2,
        'print',
        'Impression d\'un projet'
    ),
    (
        3,
        'import',
        'Importation d\'un projet'
    ),
    (
        4,
        'export',
        'Exportation d\'un projet'
    );

DROP TABLE IF EXISTS `stats_allowed_structs`;

CREATE TABLE `stats_allowed_structs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `key` varchar(10) NOT NULL,
    `description` text NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

TRUNCATE `stats_allowed_structs`;

INSERT INTO
    `stats_allowed_structs` (`id`, `key`, `description`)
VALUES (
        1,
        'app',
        'Application Tiquettes.fr'
    ),
    (
        2,
        'web',
        'Site web de l\'application'
    );

DROP TABLE IF EXISTS `stats_visits_details`;
DROP TABLE IF EXISTS `stats_visits`;

CREATE TABLE `stats_visits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ip` varchar(255) NOT NULL,
    `type` varchar(10) NOT NULL,
    `struct` varchar(10) NOT NULL,
    `url` varchar(255) NOT NULL,
    `ua` text,
    `datetime` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `date` (`datetime`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE `stats_visits_details` (
    `visit_id` int(11) NOT NULL,
    `date` date NOT NULL DEFAULT current_timestamp(),
    `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`counters`)),
    PRIMARY KEY (`visit_id`),
    CONSTRAINT `stats_visits_details_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `stats_visits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- 2025-10-20 19:50:59 UTC