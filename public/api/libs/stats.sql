-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Hôte : db5018814848.hosting-data.io
-- Généré le : sam. 08 nov. 2025 à 05:50
-- Version du serveur : 10.11.14-MariaDB-log
-- Version de PHP : 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `dbs14862378`
--
CREATE DATABASE IF NOT EXISTS `dbs14862378` DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci;
USE `dbs14862378`;

-- --------------------------------------------------------

--
-- Structure de la table `stats_action_create`
--

DROP TABLE IF EXISTS `stats_action_create`;
CREATE TABLE `stats_action_create` (
  `date` date NOT NULL DEFAULT current_timestamp(),
  `struct` varchar(10) NOT NULL,
  `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_action_export`
--

DROP TABLE IF EXISTS `stats_action_export`;
CREATE TABLE `stats_action_export` (
  `date` date NOT NULL DEFAULT current_timestamp(),
  `struct` varchar(10) NOT NULL,
  `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_action_import`
--

DROP TABLE IF EXISTS `stats_action_import`;
CREATE TABLE `stats_action_import` (
  `date` date NOT NULL DEFAULT current_timestamp(),
  `struct` varchar(10) NOT NULL,
  `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_action_print`
--

DROP TABLE IF EXISTS `stats_action_print`;
CREATE TABLE `stats_action_print` (
  `date` date NOT NULL DEFAULT current_timestamp(),
  `struct` varchar(10) NOT NULL,
  `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`counters`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_allowed_actions`
--

DROP TABLE IF EXISTS `stats_allowed_actions`;
CREATE TABLE `stats_allowed_actions` (
  `id` int(11) NOT NULL,
  `key` varchar(10) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stats_allowed_actions`
--

INSERT INTO `stats_allowed_actions` (`id`, `key`, `description`) VALUES
(1, 'create', 'Création d\'un nouveau projet'),
(2, 'print', 'Impression d\'un projet'),
(3, 'import', 'Importation d\'un projet'),
(4, 'export', 'Exportation d\'un projet');

-- --------------------------------------------------------

--
-- Structure de la table `stats_allowed_choices`
--

DROP TABLE IF EXISTS `stats_allowed_choices`;
CREATE TABLE `stats_allowed_choices` (
  `id` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Déchargement des données de la table `stats_allowed_choices`
--

INSERT INTO `stats_allowed_choices` (`id`, `key`, `description`) VALUES
(1, 'theme', 'Thèmes utilisés'),
(2, 'print', 'Préférences d\'impressions');
(3, 'print_format', 'Formats d\'impressions' );

-- --------------------------------------------------------

--
-- Structure de la table `stats_allowed_structs`
--

DROP TABLE IF EXISTS `stats_allowed_structs`;
CREATE TABLE `stats_allowed_structs` (
  `id` int(11) NOT NULL,
  `key` varchar(10) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stats_allowed_structs`
--

INSERT INTO `stats_allowed_structs` (`id`, `key`, `description`) VALUES
(1, 'app', 'Application Tiquettes.fr'),
(2, 'web', 'Site web de l\'application');

-- --------------------------------------------------------

--
-- Structure de la table `stats_visits`
--

DROP TABLE IF EXISTS `stats_visits`;
CREATE TABLE `stats_visits` (
  `id` int(11) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `regionName` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `timezone` varchar(255) NOT NULL,
  `type` varchar(10) NOT NULL,
  `struct` varchar(10) NOT NULL,
  `url` varchar(255) NOT NULL,
  `ua` text NOT NULL,
  `rfr` text NOT NULL,
  `datetime` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_visits_details`
--

DROP TABLE IF EXISTS `stats_visits_details`;
CREATE TABLE `stats_visits_details` (
  `visit_id` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `counters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`counters`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour la table `stats_action_create`
--
ALTER TABLE `stats_action_create`
  ADD PRIMARY KEY (`date`);

--
-- Index pour la table `stats_action_export`
--
ALTER TABLE `stats_action_export`
  ADD PRIMARY KEY (`date`);

--
-- Index pour la table `stats_action_import`
--
ALTER TABLE `stats_action_import`
  ADD PRIMARY KEY (`date`);

--
-- Index pour la table `stats_action_print`
--
ALTER TABLE `stats_action_print`
  ADD PRIMARY KEY (`date`);

--
-- Index pour la table `stats_allowed_actions`
--
ALTER TABLE `stats_allowed_actions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `stats_allowed_choices`
--
ALTER TABLE `stats_allowed_choices`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `stats_allowed_structs`
--
ALTER TABLE `stats_allowed_structs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `stats_visits`
--
ALTER TABLE `stats_visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `date` (`datetime`);

--
-- Index pour la table `stats_visits_details`
--
ALTER TABLE `stats_visits_details`
  ADD PRIMARY KEY (`visit_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `stats_allowed_actions`
--
ALTER TABLE `stats_allowed_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT pour la table `stats_allowed_choices`
--
ALTER TABLE `stats_allowed_choices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT pour la table `stats_allowed_structs`
--
ALTER TABLE `stats_allowed_structs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT pour la table `stats_visits`
--
ALTER TABLE `stats_visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `stats_visits_details`
--
ALTER TABLE `stats_visits_details`
  ADD CONSTRAINT `stats_visits_details_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `stats_visits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
