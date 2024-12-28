# Changelog



## [2.1.0] - 2024-01-31 - Nouvelles fonctionnalités majeures

### Ajouts

- Introduction d'un assistant de création d'un nouveau projet résidentiel. Assiste l'utilisateur en créant automatiquement un projet en fonction de la structure de son habitation.

### Améliorations

- Nouvelle fenêtre d'accueil lors de la création d'un nouveau projet.
- Amélioration de la mise en page lors de l'impression du projet.

### Corrections

- Nouvelle routine d'assignation des identifiants des modules avec correction des doublons, et filtrage des modules libres.
- Possibilité de réassigner automatiquement les identifiants des modules de l'ensemble du projet sur simple action manuelle (nouveau bouton dans la barre à outils des étiquettes).


## [2.0.2] - 2024-12-26

### Améliorations

- Affichage de la boite de dialogue 'Nouveau projet' lorsque l'utilisateur arrive de tiquettes.fr
- Possibilité d'importer un projet directement depuis la boite de dialogue 'Nouveau projet'

### Corrections

- Correction d'un bug permettant les doublons pour les identifiants de chaque module, cassant la génération du schéma.


## [2.0.1] - 2024-12-24

### Améliorations

- Nouveau design pour les barres à outils


## [2.0.0] - 2024-12-01 - Nouvelles fonctionnalités majeures

### Ajouts

- Ajout de la fonction "schéma unifilaire". Permet la génération d'un schéma unifilaire en fonction des données renseignées lors de l'édition d'un module.
- Ajout du moniteur de surveillance permettant la détection d'erreurs liées à la norme NFC 15-100
- Ajout de 2 nouveaux thèmes après demande : "Petit pictogramme et grand descriptif" et "Identifiant, petit pictogramme et grand descriptif"

### Modifications

- Changement de licence. Tiquettes passe désormais à la licence AGPL v3
- Mise à jour de tous les packages de l'application

### Améliorations

- Amélioration globale de l'UI
- Amélioration de l'ergonomie



## [1.7.2] - 2024-09-13

### Corrections

- Correction de bugs mineurs
- Correction d'un bug dans la gestion de l'impression sous Firefox


## [1.7.0] - 2024-08-02 - Nouvelles fonctionnalités majeures

### Ajouts

- Nouveaux pictogrammes:
    - Alarme incendie
    - Lingerie / Repassage
    - Bateaux / Ponton / Port
    - Audio / Musique / Multimédia
    - Télévision / Ecran / Projecteur
- Ajout d'une prévisualisation (démo) du module en cours d'édition
- Nouvelle fonctionnalité permettant de duppliquer un module (Copier / Coller) vers un emplacement suffisament grand de n'importe quelle rangée

### Améliorations

- Nouvelle liste de sélection d'un pictogramme (Affichage en liste déroulante, Possibilité de rechercher un pictogramme par sa description)

### Modifications

- Déplacement du bouton permettant de libérer (supprimer les données) un module dans la fenêtre d'édition de celui-ci


## [1.6.2] - 2024-07-05

### Ajouts

- Ajout d'annotations pour chaque module. Seulement visible sur la nomenclature.

### Améliorations

- Modification des icones pour une amélioration de la qualité d'impression


## [1.6.0] - 2024-06-15 - Nouvelles fonctionnalités majeures

### Ajouts

- Ajout d'une nomenclature automatique aux projets
- Ajout d'options pour l'impression
- Compatibilité PWA. Tiquettes est désormais installable, telle une application native, sur les appareils compatibles

### Améliorations

- Amélioration des 4 thèmes Schneider

### Corrections

- Correction du dimensionnement des modules lors de l'impression 


## [1.5.0] - 2024-06-08

### Ajouts

- Ajout de nouveaux pictogrammes: Sèche linge, Sèche serviettes, Chaudière gaz, Piscine et SPA
- Ajout des fichiers sitemap.xml et robots.txt
- Il est désormais possible de nommer son projet lors de sa création
- Ajout d'une date de création, d'une date de modification et d'un numéro de version à chaque projet
- Une date de modification est automatiquement mise à jour après chaque intervention de l'utilisateur
- Chaque exportation met à jour la version interne du projet

### Améliorations

- Amélioration de l'expérience utilisateur avec une interface graphique plus ergonomique
- Léger nettoyage du code

### Modifications

- Récriture du système de gestion des thèmes
- Nouvelle documentation


### Partenariats

- Nouveau partenaire: AZ Reso (Artisan électricien du pays Nantais - https://www.google.com/search?q=az+reso+nantes)


## [1.4.0] - 2024-06-02 - Nouvelle version majeure

### Ajouts

- Ajout, insertion, et suppression de rangées au cours du déroulement d'un projet

### Améliorations

- Auto identification des modules libres
- Affichage de l'identifiant du module précédent lors de l'édition d'un module


## [1.3.4] - 2024-06-02

### Modifications

- Nouvelle règle d'écriture de l'identifiant d'un module: de 0 à 255 caracatères composés de a-Z A-Z 0-9 _


## [1.3.3] - 2024-06-02

### Améliorations

- Correction d'un bug altérant la sélection par défaut du thème des étiquettes lors du chargement de l'application


## [1.3.2] - 2024-06-02

### Améliorations

- Amélioration de l'interface utilisateur


## [1.3.1] - 2024-06-01

### Corrections

- Correction d'un bug empechant la modification du thème


## [1.3.0] - 2024-06-01

### Ajouts

- Gestion de thèmes en temps réel, applicables aux étiquettes du projet

### Améliorations

- Meilleurs performances globales


## [1.2.0] - 2024-05-29

### Ajouts

- Compatibilité avec de nouveaux paramètres d'impression
- Possibilité de déplacer horizontalement un module dans l'espace libre à ses cotés en utilisant les icones flèches
- Possibilité de sélectionner un module puis de le déplacer ou le redimmensionner en utilisant le clavier [-] [+] [←] [→] [Entrée] [Suppr]
- Ajout d'un fichier CHANGELOG.md

### Corrections

- Correction d'une erreur empêchant de mettre correctement en page les étiquettes aux formats suprérieurs au A4
- Correction de la largeur des modules (18mm normalisé / module) lors de l'impression des étiquettes

### Modifications

- Amélioration notable de l'ergonomie de l'application suivant les changements proposés par le groupe de testeurs volontaires
