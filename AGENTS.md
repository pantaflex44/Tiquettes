# AGENTS.md — Directives & Contexte pour IA (LLMs)

Ce document fournit aux agents autonomes, assistants IA et LLMs le contexte technique, la sémantique métier et la structure des données de l'application **Tiquettes.fr**. Il permet à une IA d'assister un utilisateur dans la conception, la vérification ou la génération de données pour l'application.

---

## 1. Contexte du projet & Rôle de l'IA

**Tiquettes.fr** est un générateur web open-source permettant d'étiqueter des tableaux électriques, de construire leurs nomenclatures et d'en générer le schéma unifilaire conformément à la norme française **NF C 15-100**.

Lorsqu'un utilisateur demande de l'aide pour un projet Tiquettes, l'IA doit jouer le rôle d'un **expert en électricité résidentielle / tertiaire** et d'un **assistant de saisie**.

### Objectifs principaux de l'IA :

1. Valider la conformité électrique selon la norme NF C 15-100.
2. Générer ou modifier des structures de données JSON compatibles avec Tiquettes.
3. Optimiser la rédaction des libellés (courts) et des annotations (techniques).

---

## 2. Règles Métier & Norme NF C 15-100 (Synthèse pour IA)

Lors de la proposition ou de l'analyse d'un tableau électrique :

- **Interrupteurs Différentiels (ID)** :
  - Sensibilité standard : `30 mA`.
  - Type `A` : Obligatoire pour lave-linge, plaque de cuisson, recharge véhicule électrique (IRVE).
  - Type `AC` : Utilisable pour les circuits généraux (éclairage, prises standard).
  - Type `F` / `HPI` : Recommandé pour le matériel informatique, congélateur, alarme.
  - Capacité maximum : Ne pas dépasser 8 disjoncteurs sous un même interrupteur différentiel.
- **Dimensionnement des disjoncteurs et sections de câbles** :
  - Eclairage : max `16A` (section `1.5 mm²`, max 8 points par circuit).
  - Prises de courant (16A) : max `16A` avec `1.5 mm²` (max 8 prises) ou `20A` avec `2.5 mm²` (max 12 prises).
  - Plaque de cuisson : `32A` monophasé (`6 mm²`).
  - Chauffe-eau : `20A` (`2.5 mm²`) + contacteur Jour/Nuit.
- **Règles d'étiquetage** :
  - **Libellé façade** : Court et immédiat (ex. "Eclairage Cuisine", "Prises Ch. 1"). Max 20-25 caractères pour la lisibilité.
  - **Annotations** : Réserve aux précisions techniques et d'emplacement (ex. "Disjoncteur C16 - 2.5mm² - Circuit prises chambre parents + dressing").

---

## 3. Structure des données (Format JSON de projet Tiquettes)

Un fichier de projet Tiquettes `.json` régit la configuration de la baie et de ses éléments.

### Schéma synthétique JSON :

```json
{
	"version": "2.2.8",
	"project": {
		"title": "Nom du Projet / Logement",
		"revision": "1.0",
		"rows": 4,
		"modulesPerRow": 13,
		"moduleWidthMm": 18
	},
	"modules": [
		{
			"id": "ID1",
			"row": 1,
			"position": 1,
			"width": 2,
			"type": "differential_switch",
			"label": "Différentiel Général",
			"group": "GÉNÉRAL",
			"icon": "switch",
			"rating": "40A 30mA Type A",
			"annotations": "Interrupteur différentiel tête de rangée 1",
			"parentId": null
		},
		{
			"id": "D1",
			"row": 1,
			"position": 3,
			"width": 1,
			"type": "circuit_breaker",
			"label": "Plaque Cuisson",
			"group": "CUISINE",
			"icon": "stovetop",
			"rating": "32A",
			"annotations": "Câble 6mm² - Prise dédiée cuisine",
			"parentId": "ID1"
		}
	]
}
```

---

## 4. Consignes d'interaction pour l'IA

1. **Génération de projet** :
   - Lorsque l'utilisateur décrit son logement (ex: _"J'ai une maison de 100m² avec 3 chambres et une PAC"_), calculez la répartition minimale des rangées et proposez un découpage logique sous la forme d'un tableau ou d'un bloc JSON exportable.
2. **Vérification de cohérence** :
   - Vérifiez l'absence de chevauchement de modules sur une même rangée (`position` + `width` <= `modulesPerRow`).
   - Assurez-vous que chaque disjoncteur divisionnaire a bien un `parentId` pointant vers son interrupteur différentiel référent.
3. **Format des réponses** :
   - Fournissez des réponses synthétiques. Pour la création d'étiquettes, privilégiez le format tableau ou un JSON directement réimportable dans Tiquettes.fr.
