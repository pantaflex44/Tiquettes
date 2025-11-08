# ChangeLog

## [2.2.7] - 2025-11-08

### Corrections

- Modification du rendu du schéma unifilaire pour améliorer sa lecture.
- [[Discussion #43](https://github.com/pantaflex44/Tiquettes/discussions/43)] Modification de la déclaration d'asservissement d'un module. Il est désormais possible de définir un asservissement partiel, permettant d'indiquer qu'un module peut non seulement être asservi par un contacteur mais aussi alimenter directement les autres sources.

### Ajouts

- Nouvelle fonctionnalité permettant d'indiquer une nouvelle version disponible de l'application. L'utilisateur devra recharger la page de l'application pour en bénéficier.
- Ajout de la fonction 'Prise modulaire' dans l'éditeur de schéma (Demande directe d'un utilisateur).
- [[Discussion #44](https://github.com/pantaflex44/Tiquettes/discussions/44)] Ajout d'un nouveau pictogramme: 'Réseau électrique'.


## [2.2.5] - 2025-10-03

### Corrections

- Mise à jour globale de toutes les dépendances.
- Correction des pictogrammes qui possédaient un problème de colorisation lors du rendu PDF.
- [[Issue #40](https://github.com/pantaflex44/Tiquettes/issues/40)] Correction du moteur de rendu PDF pour la création d'étiquettes de très petites hauteurs.
- Correction d'un bug qui empèchait de renseigner correctement le groupe lors de l'exportation d'un thème.
- Légère correction de la position des éléments dans chaque thème imprimable.
- Optimisation des pictogrammes pour améliorer le rendu dans les documents PDF.
- [[Issue #28](https://github.com/pantaflex44/Tiquettes/issues/28)] Suppression de la limite de 3 lignes lors de l'impression des propriétés d'un module pour former la nomenclature.

### Ajouts

- [[Issue #41](https://github.com/pantaflex44/Tiquettes/issues/41)] Nouvelle propriété permettant de renseigner la phase utilisée lors d'une distribution monophasée à partir d'un parent triphasé.
- Nouveau bouton 'zoom' dans la vue schéma de l'éditeur. Permet de légerement agrandir visuellement le schéma affiché.
- [[Issue #38](https://github.com/pantaflex44/Tiquettes/issues/38)] Nouvelle fonctionnalité permettant le choix du format d'impression pour les pages relatives aux étiquettes, schéma unifilaire et nomenclature. 2 choix possibles: A4 et A3.
- [[Discussion #36](https://github.com/pantaflex44/Tiquettes/discussions/36)] Réponse à une proposition, nouvelle fonctionnalité qui permet d'associer un module à un groupe via une couleur. Couleur utilisée (si disponible et si demandée) par les thèmes.


## [2.2.4] - 2025-09-07

### Corrections

- Correction d'un bug rendant obligatoire la définition de la section des conducteurs affiliés à chaque module.  3 nouvelles possibilité:
	- Détection automatique : défini automatiquement la section en fonction du calibre
	- Inconnue : pas de section définie
	- Xmm² : définition arbitraire


## [2.2.3] - 2025-08-25

### Corrections

- [[zoliaaz](https://github.com/zoliaaz)] Retour du raccourci pour supprimer rapidement un module.
- Edition d'un module en cliquant sur ses propriétés depuis la nomenclature.

### Modifications

- Retrait du système d'impression standard. L'impression PDF est devenue le seul mode disponible.

### Ajouts

- [[zoliaaz](https://github.com/zoliaaz)] Ajout de la propriété '_Fonction_' pour chaque module. Représentation textuelle de la fonction d'un module (Type). Permets de réaliser des étiquettes où l'icône est remplacée par sa fonction textuelle.
- [[zoliaaz](https://github.com/zoliaaz)] Création d'un nouveau thème pour l'occasion : '_Type et Description seulement_'.
- [[zoliaaz](https://github.com/zoliaaz)] Ajout d'une option d'impression permettant d'indiquer, hors zone de coupe, le calibre sous chaque module pour faciliter l'installation de ceux-ci.
- [[zoliaaz](https://github.com/zoliaaz)] Ajout de la propriété '_Section des conducteurs_' pour chaque module.
- [[Discussion #29](https://github.com/pantaflex44/Tiquettes/discussions/29#discussioncomment-13903864)] Possibilité d'imprimer ou non la page de garde.
- Ajout de nouveaux types de modules pour le schéma unifilaire : '_Fusible_', '_Carillon_', '_Voyant_', '_Commande NO et NF_', '_Bouton poussoir NO et NF_'.


## [2.2.2] - 2025-05-23

### Ajouts

- Ajout de lignes de coupe pour les massicots.
- Ajout de nouvelles propriétés d'impression.
- Ajout de quelques statistiques accessibles publiquement à l'adresse : https://www.tiquettes.fr/stats.php


## [2.2.1] - 2025-05-12

### Corrections

- Gros correctif suite à la dernière mise à jour majeure.
	- Téléchargement des thèmes : corrigé
	- Impression au format PDF : corrigé


## [2.2.0] - 2025-05-11

### Corrections

- Mise à jour de toutes les dépendances.
- Nette amélioration de la qualité visuelle des pictogrammes et symboles électriques.
- Possibilité d'éditer tous les thèmes proposés !

### Ajouts

- [[Issue #8](https://github.com/pantaflex44/Tiquettes/issues/8)] Grosse nouveauté, ajout de la fonction 'Imprimer au format PDF' dans le menu d'impression d'un projet. Cette nouvelle fonctionnalité permet de résoudre les problèmes de compatibilité avec certains navigateurs basés sur Gecko (Firefox, etc.) et Webkit (Safari, etc.). Une fois la case cochée, le projet est converti en un fichier PDF pour être imprimé correctement en toutes circonstances !
- Nouveau service externe de conversion d'un projet Tiquettes (>= 2.1.5) en document PDF accessible à l'adresse : https://www.tiquettes.fr/pdf.php.
- Mise à disposition d'une bibliothèque de thèmes à télécharger pour embellir ses étiquettes (https://www.tiquettes.fr/themes.php).


## [2.1.5] - 2025-04-23

### Ajouts

- [[PR #21](https://github.com/pantaflex44/Tiquettes/pull/21)] Nouveaux pictogrammes:
	- Horloge Journaliere
	- Horloge Hebdomadaire
	- Moteur Electrique
	- Chargeur
	- Maison / Dépendance / Extension
	- Onduleur
	- Interrupteur différentiel


## [2.1.4] - 2025-04-22

### Corrections

- [[Discussions #17](https://github.com/pantaflex44/Tiquettes/discussions/17)] Correction d'un bug affectant la représentation correcte d'un contacteur si son parent et le disjoncteur asservi sont les mêmes (télérupteur par exemple asservissant son disjoncteur parent).
- [[PR #18](https://github.com/pantaflex44/Tiquettes/pull/18)] Correction des fautes d'orthographes dans les noms des icônes.
- [[Discussion #19](https://github.com/pantaflex44/Tiquettes/discussions/19)] Séparation des icônes 'Volet roulant / Store / Porte de garage' en 3 icônes indépendantes.
- Adaptation automatique des anciens projets au nouveau système de thème.

### Modifications

- Modification du système de thèmes.

### Ajouts

- [[Discussions #19](https://github.com/pantaflex44/Tiquettes/discussions/19)] Nouveau pictogramme:
	- Pompe de relevage


## [2.1.3] - 2025-04-11

### Corrections

- [[PR #12](https://github.com/pantaflex44/Tiquettes/pull/12)] Correction du fichier README.md.

### Ajouts

- [[Issue #13](https://github.com/pantaflex44/Tiquettes/issues/13)] Nouveau pictogramme:
	- Détecteur de fumées
	- Sonnette / Carillon
	- Alarme intrusion
	- Transformateur


## [2.1.2] - 2025-03-23

### Corrections

- [[Issue #11](https://github.com/pantaflex44/Tiquettes/issues/11)] Correction d'un bug affectant la sélection d'un pictogramme dans l'éditeur de module.


## [2.1.1] - 2025-03-21

### Corrections

- Amélioration des performances dans l'éditeur de modules.
- Amélioration légère de l'ergonomie.
- Réécriture partielle du système de Copier / Coller et intégration de la fonction Couper.
- Correction de divers bugs lors de la manipulation des modules.


## [2.1.0] - 2025-03-12

### Corrections

- [[Issue #9](https://github.com/pantaflex44/Tiquettes/issues/9)] Prise en compte de la règle de l'amont dans le monitoring des interrupteurs différentiels.
- [[Issue #10](https://github.com/pantaflex44/Tiquettes/issues/10)] Modification de la représentation des contacteurs (J/N, télérupteurs, minuteries, etc). Il est désormais possible d'asservir un départ avec un contacteur précédement ajouté.
- Correction d'un bug empêchant le ré-assignement automatique des identifiants parents lors de la modification de l'identifiant d'un module.

### Ajouts

- Nouveau pictogramme:
	- Telerupteur
	- Parafoudre
- Ajout d'un éditeur pour personnaliser le thème de ses étiquettes.
- Ajout de 2 nouveaux thèmes personnalisés dans la rubrique 'Créations: GoldenWine, 'Créations: Orange is the new dark'.


## [2.0.5] - 2025-02-12

### Corrections

- Légère correction de bugs dans l'interface.

### Ajouts

- Pour améliorer la compatibilité avec les anciens tableaux électriques, il est désormais possible de régler la largeur des étiquettes. 17.5mm ou 18mm par module.


## [2.0.4] - 2025-01-27

### Corrections

- [[Issue #7](https://github.com/pantaflex44/Tiquettes/issues/7)] Correction du symbole 'Interrupteur Sectionneur'.

### Ajouts

- Il est désormais possible de réduire d'une demi taille, un module ayant une taille de plus d'un emplacement (fonctionnalité en cours de test).


## [2.0.3] - 2024-12-31

### Corrections

- Nouvelle fenêtre d'accueil lors de la création d'un nouveau projet.
- Amélioration de la mise en page lors de l'impression du projet.
- Nouvelle routine d'assignation des identifiants des modules avec correction des doublons, et filtrage des modules libres.
- Possibilité de réassigner automatiquement les identifiants des modules de l'ensemble du projet sur simple action manuelle (nouveau bouton dans la barre à outils des étiquettes).


## [2.0.2] - 2024-12-26

### Corrections

- Affichage de la boite de dialogue 'Nouveau projet' lorsque l'utilisateur arrive de tiquettes.fr.
- Possibilité d'importer un projet directement depuis la boite de dialogue 'Nouveau projet'.
- Correction d'un bug permettant les doublons pour les identifiants de chaque module, cassant la génération du schéma.


## [2.0.1] - 2024-12-24

### Corrections

- Nouveau design pour les barres à outils.


## [2.0.0] - 2024-12-01

### Corrections

- Changement de licence. Tiquettes passe désormais à la licence AGPL v3.
- Mise à jour de tous les packages de l'application.
- Amélioration globale de l'UI.
- Amélioration de l'ergonomie.

### Ajouts

- Ajout de la fonction 'schéma unifilaire'. Permet la génération d'un schéma unifilaire en fonction des données renseignées lors de l'édition d'un module.
- Ajout du moniteur de surveillance permettant la détection d'erreurs liées à la norme NFC 15-100.
- Ajout de 2 nouveaux thèmes après demande: 'Petit pictogramme et grand descriptif' et 'Identifiant, petit pictogramme et grand descriptif'.


## [1.7.2] - 2024-09-13

### Corrections

- Correction de bugs mineurs.
- Correction d'un bug dans la gestion de l'impression sous Firefox.


## [1.7.0] - 2024-08-02

### Corrections

- Nouvelle liste de sélection d'un pictogramme (Affichage en liste déroulante, Possibilité de rechercher un pictogramme par sa description).

### Modifications

- Déplacement du bouton permettant de libérer (supprimer les données) un module dans la fenêtre d'édition de celui-ci.

### Ajouts

- Nouveaux pictogrammes:
	- Alarme incendie
	- Lingerie / Repassage
	- Bateaux / Ponton / Port
	- Audio / Musique / Multimédia
	- Télévision / Ecran / Projecteur
- Ajout d'une prévisualisation (démo) du module en cours d'édition.
- Nouvelle fonctionnalité permettant de duppliquer un module (Copier / Coller) vers un emplacement suffisament grand de n'importe quelle rangée.


## [1.6.2] - 2024-07-05

### Corrections

- Modification des icones pour une amélioration de la qualité d'impression.

### Ajouts

- Ajout d'annotations pour chaque module. Seulement visible sur la nomenclature.


## [1.6.0] - 2024-06-15

### Corrections

- Amélioration des 4 thèmes Schneider.
- Correction du dimensionnement des modules lors de l'impression.

### Ajouts

- Ajout d'une nomenclature automatique aux projets.
- Ajout d'options pour l'impression.
- Compatibilité PWA. Tiquettes est désormais installable, telle une application native, sur les appareils compatibles.


## [1.5.0] - 2024-06-08

### Corrections

- Amélioration de l'expérience utilisateur avec une interface graphique plus ergonomique.
- Léger nettoyage du code.
- Récriture du système de gestion des thèmes.
- Nouvelle documentation.

### Ajouts

- Ajout de nouveaux pictogrammes: Sèche linge, Sèche serviettes, Chaudière gaz, Piscine et SPA.
- Ajout des fichiers sitemap.xml et robots.txt.
- Il est désormais possible de nommer son projet lors de sa création.
- Ajout d'une date de création, d'une date de modification et d'un numéro de version à chaque projet.
- Une date de modification est automatiquement mise à jour après chaque intervention de l'utilisateur.
- Chaque exportation met à jour la version interne du projet.
- Nouveau partenaire: AZ Reso (Artisan électricien du pays Nantais - https://www.google.com/search?q=az+reso+nantes)


## [1.4.0] - 2024-06-02

### Corrections

- Auto identification des modules libres.
- Affichage de l'identifiant du module précédent lors de l'édition d'un module.

### Ajouts

- Ajout, insertion, et suppression de rangées au cours du déroulement d'un projet.


## [1.3.4] - 2024-06-02

### Corrections

- Nouvelle règle d'écriture de l'identifiant d'un module: de 0 à 255 caracatères composés de a-Z A-Z 0-9 _.


## [1.3.3] - 2024-06-02

### Corrections

- Correction d'un bug altérant la sélection par défaut du thème des étiquettes lors du chargement de l'application.


## [1.3.2] - 2024-06-02

### Corrections

- Amélioration de l'interface utilisateur.


## [1.3.1] - 2024-06-01

### Corrections

- Correction d'un bug empechant la modification du thème.


## [1.3.0] - 2024-06-01

### Corrections

- Meilleurs performances globales.

### Ajouts

- Gestion de thèmes en temps réel, applicables aux étiquettes du projet.


## [1.2.0] - 2024-05-29

### Corrections

- Correction d'une erreur empêchant de mettre correctement en page les étiquettes aux formats suprérieurs au A4.
- Correction de la largeur des modules (18mm normalisé / module) lors de l'impression des étiquettes.
- Amélioration notable de l'ergonomie de l'application suivant les changements proposés par le groupe de testeurs volontaires.

### Ajouts

- Compatibilité avec de nouveaux paramètres d'impression.
- Possibilité de déplacer horizontalement un module dans l'espace libre à ses cotés en utilisant les icones flèches.
- Possibilité de sélectionner un module puis de le déplacer ou le redimmensionner en utilisant le clavier [-] [+] [←] [→] [Entrée] [Suppr].
- Ajout d'un fichier CHANGELOG.md.


