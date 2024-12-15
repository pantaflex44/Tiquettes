# Tiquettes

Générateur d'étiquettes pour tableaux / armoires électriques.

---


[<img alt="URL" src="https://img.shields.io/badge/🠊-https://www.tiquettes.fr-%3CCOLOR%3E?style=for-the-badge&color=darkcyan&labelColor=darkcyan">](https://www.tiquettes.fr)

<img alt="Licence" src="https://img.shields.io/badge/Licence-MIT-%3CCOLOR%3E?style=flat&color=fff">&nbsp;&nbsp;
<img alt="Création" src="https://img.shields.io/badge/Création-26/05/2024-%3CCOLOR%3E?style=flat&color=fff">&nbsp;&nbsp;
<img alt="Auteur" src="https://img.shields.io/badge/Auteur-Christophe LEMOINE <pantaflex (at) hotmail (dot) fr>-%3CCOLOR%3E?style=flat&color=fff">

---

![Tiquettes](./docs/_sample.png)

## Le projet

Tout commence par l'initialisation de son projet.

Deux possibilités :

- Créer un nouveau projet
- Importer un projet sauvegardé

![Nouveau projet](./docs/_project_actions1.png)

### Créer un nouveau projet par défaut

![Nouveau projet](./docs/_new_project.png)

L'application définie automatiquement un tableau électrique de 4 rangées, 13 modules par rangée avec une hauteur des étiquettes de 30mm.

Bien évidement, vous pouvez modifier ces valeurs en agissant sur les réglages proposés. Commencez par le réglage du nombre de modules, puis de rangées, et finissez avec la hauteur des étiquettes.

Le nouveau tableau s'ajustera automatiquement.

### Importer un projet sauvegardé

Tiquettes vous propose d'importer et d'exporter votre travail pour l'archiver ou y retravailler ultérieurement. Une sauvegarde automatique de votre session de travail est aussi intégrée au système.

Pour importer un projet, cliquez sur le bouton `Importer` puis chargez le fichier correspondant à votre projet. Immédiatement, celui-ci s'affichera dans la zone de travail!

### Résumé du projet

Une fois le projet chargé, vous retrouverez un résumé de ses propriétés au dessus de la zone de travail.

![Nouveau projet](./docs/_project_resume.png)

Sous le nom du projet, vous retrouvez le numéro de la dernière version exportée, les caractéristiques de l'enveloppe, ainsi que dans l'ordre, la date de création et la date de dernière modification.

> <b>🛈 Bon à savoir</b>
>
> Pour modifier le nom du projet, cliquez dessus puis validez les modifications avec la touche `Entrée` de votre clavier. A contrario, la touche `Echap` annule les modifcations.
>
> ![Modifier le nom du projet](./docs/_edit_project_name.png)

Puis, vous retrouvez les dates de travail ainsi que le descriptif technique.

## L'éditeur

### Descriptif

Un tableau peut comporter de 1 à 15 rangées, 13, 18 ou 24 modules par rangée.

Chaque module peut avoir une largeur et/ou une position réglable en fonction de la place disponible autour de lui. Vous pourrez l'étendre jusqu'à rencontrer, soit le bout de la rangée, soit un autre module déja défini. Vous devrez libérer celui-ci pour pousuivre son expansion. Idem pour le déplacer, seulement possible dans les espaces libres.

### Menu contextuel du haut

![Menu contextuel du haut](./docs/_top.png)

Le symbole `+` vous permet d'agrandir le module d'une largeur sur sa droite.

Le symbole `-` vous permet de réduire le module d'une largeur.

Le symbole `←` vous permet de déplacer le module d'une position sur la gauche.

Le symbole `→` vous permet de déplacer le module d'une position sur la droite.

### Menu contextuel du bas

![Menu contextuel du bas](./docs/_bottom.png)

Le symbole `Crayon` (ou la touche `Entrée` du clavier) permet d'éditer le module en question.

#### Copier / Coller

Le symbole suivant permet de copier le module. Celà permet de copier, le libellé, le pictogramme et la description du module pour le duppliquer ailleurs sur le tableau. Une fois le module mis dans le presse papier, l'application vous met en avant les emplacements disponibles en fonction de la largeur initiale du module copié.

![Copier](./docs/_copy.png)

Exemple d'emplacements disponibles:

![Coller aux emplacements disponibles](./docs/_pasteall.png)

Cliquer sur le bouton pour duppliquer le module à cet emplacement :

![Coller](./docs/_paste.png)

Pour annuler, soit, cliquer sur l'icône ci-dessous, soit appuyer sur la touche `Echap`:

![Annuler](./docs/_paste_cancel.png)

Et voilà!

![Collé!](./docs/_pasted.png)


### Manipuler les rangées

Au cours de l'édition de votre planche d'étiquette, il peut parfois être utile d'insérer et/ou de supprimer une rangée.

Pour insérer une rangée, cliquez sur le raccourci présent entre chacune des rangées éxistantes:

![Insérer une rangée](./docs/_add_row.png)

Pour supprimer une rangée, cliquez sur l'icone `Corbeille`, à gauche du nom de la rangée souhaitée:

![Supprimer une rangée](./docs/_delete_row.png)

#### Raccourcis claviers / souris

Lors de la définition de votre planche d'étiquettes, vous pouvez utiliser votre clavier pour interagir sur les rangées et les modules.

- Pour faire défiler les rangées verticalement, vous pouvez utiliser les flèches `haut` et `bas` de votre clavier, l'ascenseur de la fenètre ou la roulette de votre souris.
- Pour faire défiler les rangées horizontalement, vous pouvez utiliser l'ascenseur de la fenètre ou la roulette de votre souris (en appuyant simultanement sur une des touches `shift` de votre clavier).
- Pour déplacer un module horizontalement, sélectionnez le avec votre souris, puis appuyez sur les flèches `gauche` et `droite` de votre clavier.
- Pour redimensionner un module, sélectionnez le avec votre souris, puis appuyez sur les touches `+` et `-` de votre clavier.

## Edition d'un module

Après avoir cliqué sur le symbole d'édition d'un module, une fenêtre popup s'ouvre et vous offre la possibilité d'affiner sa définition.

La partie inférieure de la fenètre d'édition comporte une zone de démonstration, mettant en scène vos modifications en temps réel.

![Edition d'un module](./docs/_popup.png)

- _Identifiant_ : Identifiant technique du module. Seules les lettres, chiffres et le caractère point son acceptés.
- _Libellé_ : Une très courte description du module. Les retours à la ligne sont pris en compte.
- _Pictogramme_ : Une petite image illustrant l'environement du module.

### Les actions disponibles

- **Supprimer**: Permet de libérer un module. Supprime toutes les données liées à ce module.
- **Annuler**: Annule les modifications en cours
- **Valider**: Accepter et appliquer les modifications en cours

### Les pictogrammes

Une liste de pictogrammes vous est proposée.

![Liste des pictogrammes](./docs/_icon_selector.png)

Par ailleurs, vous pouvez aussi rechercher un picto, directement en écrivant une partie de sa description. La liste se mettra automatiquement à jour.

![Rechercher un pictogramme](./docs/_icon_selector_search.png)

## Décorer ses étiquettes

![Sélection du thème](./docs/_theme_selector.png)

A chacun son style, à chaque coffret sa marque, quoi de mieux que de pouvoir décorer ses étiquettes au style de la marque du matériel installé?

Sélectionnez le thème de votre choix puis admirez le style de vos étiquettes changez en temps réel!

![Sélection du thème](./docs/_theme_selector2.png)

- Thème Simple

![Thème Simple](./docs/_theme_simple.png)

- Thème Minimal

![Thème Minimal](./docs/_theme_minimal.png)

- Thème Schneider - Standard

![Thème Schneider - Standard](./docs/_theme_schn_std.png)

- Thème Schneider - Alternatif

![Thème Schneider - Alternatif](./docs/_theme_schn_alt.png)

- Thème Schneider - Nouveau format - Logements

![Thème Schneider - Nouveau format - Logements](./docs/_theme_schn_lgt.png)

- Thème Schneider - Nouveau format - Tertiaire

![Thème Schneider - Nouveau format - Tertiaire](./docs/_theme_schn_ter.png)

- Thème Hager - Ancien format - Logements

![Thème Hager - Ancien format - Logements](./docs/_theme_hgr_algt.png)

- Thème Hager - Ancien format - Tertiaire

![Thème Hager - Ancien format - Tertiaire](./docs/_theme_hgr_ater.png)

- Thème Hager - Nouveau format - Logements

![Thème Hager - Nouveau format - Logements](./docs/_theme_hgr_nlgt.png)

- Thème Hager - Nouveau format - Tertiaire

![Thème Hager - Nouveau format - Tertiaire](./docs/_theme_hgr_nter.png)

- Thème Legrand - Monochrome - Logements

![Thème Legrand - Monochrome - Logements](./docs/_theme_lgd_mlgt.png)

- Thème Legrand - Monochrome - Tertiaire

![Thème Legrand - Monochrome - Tertiaire](./docs/_theme_lgd_mter.png)

- Thème Legrand - Couleur - Logements

![Thème Legrand - Couleur - Logements](./docs/_theme_lgd_clgt.png)

- Thème Legrand - Couleur - Tertiaire

![Thème Legrand - Couleur - Tertiaire](./docs/_theme_lgd_cter.png)

## Schéma unifilaire

### Edition des caractéristiques

Depuis la version 2.0.0, Tiquettes propose la génération semi-automatique d'un schéma unifilaire représentatif du tableau électrique conçu par vos soins.

La fenètre dédition d'un module possède désormais un nouvel onglet ```Schéma``` permettant de définir les caractèristiques techiniques du module:

![Edition des caractéristiques techniques](./docs/_popup_schema.png)

- _Fonction_ : Fonction technique du module : Interrupteur différentiel, Disjoncteur, etc.
- _Parent_ : Module parent dont dépend le module en cours d'édition. Par exemple, ce disjoncteur dépend d'un module Interrupteur différentiel.

Les autres informations sont dynamiquement adaptées à la fonction choisie précédement.

La zone de démonstration affiche la représentation graphique (Symbole) et les caractéristiques techniques telles qu'elles seront incluses dans le schéma unifilaire global.

### Génération du schéma unifilaire

La génération dépend à 100% des données que vous aurez renseignées lors de l'édition d'un module.

Le schéma généré en temps réel est accessible via l'onglet ```Schéma``` du tableau de bord :

![Schéma unifilaire](./docs/_schema.png)

Pour éditer un module, il suffit juste de cliquer dessus ;-)

![Schéma unifilaire](./docs/_schema_editor.png)

Au-dessus du schéma vous retrouverez l'espace ```barre à outils``` vous proposant dans cet onglet, différents réglages.

Pour commencer, vous avez la possibilité d'ajouter un ```Disjoncteur de branchement``` à votre schéma. Vous pouvez l'activer ou le désactiver en utilisant cette icône ![Disjoncteur de branchement](./docs/_icon_db.svg).
Différents réglages sont disponibles pour s'adapter au mieux à votre besoin.

S'ensuit la possibilité, via un clique sur cette icône ![Bornier de terre](./docs/_icon_ground.svg), d'ajouter un bornier / ligne de terre au schéma.

L'icône ![Moniteur](./docs/_icon_monitor.svg) permet d'activer ou non le <a href="#moniteur-de-surveillance">Moniteur de surveillance</a>.

## Moniteur de surveillance

Certains onglets, se voient ajouté dans leur barre à outils, un bouton d'activation du moniteur de surveillance ![Moniteur](./docs/_icon_monitor.svg). 

Depuis la version 2.0.0 de l'application, Tiquettes vous propose une relative détection des erreurs dans votre projet. Ces "erreurs", correspondent à des règles définies dans la norme NFC 15-100 à l'instant T. Vous pouvez bien évidement désactiver cette surveillance à tout moment.

![Surveillance - Aucun problème détecté](./docs/_monitor_ok.png) ![Surveillance - Erreur détectés](./docs/_monitor_errors.png)

Le moniteur surveillera l'application des règles suivantes (NFC 15-100 09/2024) :
- ```Etiquettes```: Le respect du minimum de 20% d'espace libre dans l'enveloppe du tableau.
- ```Schéma```: Le nombre de circuits associés à un interrupteur différentiel : 8.
- ```Schéma```: Le nombre minimum d'interrupteurs différentiels : 2.
- ```Schéma```: Le type de protection différentielle parente pour les circuits Plaque de cuisson, Chauffages et Bornes/Prises de recharge : Type A.
- ```Schéma```: Le calibre de l'interrupteur sectionneur en fonction du calibre du disjoncteur de branchement (si ajouté au schéma).
- etc.

![Surveillance - Exemple d'erreur](./docs/_monitor_errors_details.png)

La surveillance, lors de la conception de votre projet, s'améliorera avec le temps et de nouvelles règles s'ajouterons au fûr et à mesure des prochaines versions !

## Nomenclature / Résumé

Tiquettes vous propose de résumer votre projet.

La nomenclature est générée automatiquement en fonction des définitions indiquées dans l'éditeur.

![Nomenclature](./docs/_summary.png)

La barre à outils regroupe cette fois, la liste des colones que vous souhaitez afficher. Ce paramètre est automatiquement associé à votre projet, ce qui signifie qu'il sera, lui aussi, exporté.

## Immortaliser son travail

![Immortaliser](./docs/_actions.png)

Une fois vos étiquettes réalisées, vous pourrez les imprimer en cliquant sur le bouton adéquat.

Le mode `paysage` ainsi que le format A4 sont sélectionnés par défault.

> <b>🛈 Bon à savoir</b>
>
> Imprimez toujours en taille réelle sans ajustement de la page. Surtout valable si vous souhaitez imprimer un projet préalablement enregistré en PDF. Acrobat Reader, notamment, ajuste par défaut le document au format papier sélectionné.

## Fin!
