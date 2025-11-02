# Tiquettes

Générateur d'étiquettes pour tableaux / armoires électriques.

---


[<img alt="URL" src="https://img.shields.io/badge/🠊-https://www.tiquettes.fr-%3CCOLOR%3E?style=for-the-badge&color=darkcyan&labelColor=darkcyan">](https://www.tiquettes.fr)

<img alt="Version" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fwww.tiquettes.fr%2Fapp%2Finfos.json&query=%24.version&label=Current&prefix=v&color=%23fff">&nbsp;&nbsp;
<img alt="Licence" src="https://img.shields.io/badge/Licence-AGPL v3-%3CCOLOR%3E?style=flat&color=fff">&nbsp;&nbsp;
<img alt="Création" src="https://img.shields.io/badge/Création-26/05/2024-%3CCOLOR%3E?style=flat&color=fff">&nbsp;&nbsp;
<img alt="Auteur" src="https://img.shields.io/badge/Auteur-Christophe LEMOINE <contact (at) tiquettes (dot) fr>-%3CCOLOR%3E?style=flat&color=fff">

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T61BPPX0)

---

## 📢 Bon à savoir

### Une question ? Des idées à partager / proposer ?

Venez dans le nouvel **[espace de discussions](https://github.com/pantaflex44/Tiquettes/discussions)** !

### A contrario, vous avez découvert un bug, un défaut de fonctionnement ?

Venez plutôt le déclarer dans **[l'espace dédié](https://github.com/pantaflex44/Tiquettes/issues)** :-)

### Vous êtes plus "réseaux sociaux" ?

Retrouvez **Tiquettes** directement sur **[sa page Facebook](https://www.facebook.com/profile.php?id=61563821616548)** !

### Tester en avant première

Vous pouvez tester Tiquettes en cours de développement avant la sortie officielle de sa nouvelle version en utilisant ce lien: **https://www.tiquettes.fr/dev/** ;-)

---

# Bienvenue dans la documentation de Tiquettes

![Tiquettes](https://github.com/pantaflex44/Tiquettes/blob/main/docs/_sample.png?raw=true)

## Le projet

Tout commence par l'initialisation de son projet.

Deux possibilités proposées dans la barre à outils :

- Créer un nouveau projet
- Importer un projet sauvegardé

![Nouveau projet](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_project_actions1.png)

Ou bien même, directement dans la fenêtre de bienvenue :

![Nouveau projet](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_welcome.png?raw=true)

### Créer un nouveau projet par défaut

![Nouveau projet](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_new_project.png?raw=true)

L'application définie automatiquement un tableau électrique de 4 rangées, 13 modules par rangée avec une hauteur des
étiquettes de 30mm.

Bien évidement, vous pouvez modifier ces valeurs en agissant sur les réglages proposés. Commencez par le réglage du
nombre de modules, puis de rangées, et finissez avec la hauteur des étiquettes.

Le nouveau tableau s'ajustera automatiquement.

### Importer un projet sauvegardé

Tiquettes vous propose d'importer et d'exporter votre travail pour l'archiver ou y retravailler ultérieurement. Une
sauvegarde automatique de votre session de travail est aussi intégrée au système.

Pour importer un projet, cliquez sur le bouton `Importer` puis chargez le fichier correspondant à votre projet.
Immédiatement, celui-ci s'affichera dans la zone de travail!

### Résumé du projet

Une fois le projet chargé, vous retrouverez un résumé de ses propriétés au-dessus de la zone de travail.

![Nouveau projet](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_project_resume.png?raw=true)

Sous le nom du projet, vous retrouvez le numéro de la dernière version exportée, les caractéristiques de l'enveloppe,
ainsi que dans l'ordre, la date de création et la date de dernière modification.

> <b>🛈 Bon à savoir</b>
>
> Pour modifier le nom du projet, cliquez dessus puis validez les modifications avec la touche `Entrée` de votre
> clavier. A contrario, la touche `Echap` annule les modifications.
>
> ![Modifier le nom du projet](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_edit_project_name.png?raw=true)

Puis, vous retrouvez les dates de travail ainsi que le descriptif technique.

## L'éditeur

![Éditeur](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_editeur.png?raw=true)

### Descriptif

Un tableau peut comporter de 1 à 15 rangées, 13, 18 ou 24 modules par rangée.

Chaque module peut avoir une largeur et/ou une position réglable en fonction de la place disponible autour de lui. Vous
pourrez l'étendre jusqu'à rencontrer, soit le bout de la rangée, soit un autre module déjà défini. Vous devrez libérer
celui-ci pour poursuivre son expansion. Idem pour le déplacer, seulement possible dans les espaces libres.

### Menu contextuel du haut

![Menu contextuel du haut](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_top.png?raw=true)

Le symbole `+` vous permet d'agrandir le module d'une largeur sur sa droite.

Le symbole `-` vous permet de réduire le module d'une largeur.

Le symbole `←` vous permet de déplacer le module d'une position sur la gauche.

Le symbole `→` vous permet de déplacer le module d'une position sur la droite.

### Menu contextuel du bas

![Menu contextuel du bas](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_bottom.png?raw=true)

Le symbole `Crayon` (ou la touche `Entrée` du clavier) permet d'éditer le module en question.

#### Copier / Couper / Coller

Le symbole suivant permet de copier le module. Cela permet de copier, le libellé, le pictogramme et la description du
module pour le dupliquer ailleurs sur le tableau. Une fois le module mis dans le presse papier, l'application vous met
en avant les emplacements disponibles en fonction de la largeur initiale du module copié.

![Copier](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_copy.png?raw=true)

Exemple d'emplacements disponibles :

![Coller aux emplacements disponibles](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_pasteall.png?raw=true)

Cliquer sur l'icône pour dupliquer / d&placer le module à cet emplacement.

Pour annuler, soit, cliquer sur l'icône ci-dessous, soit appuyer sur la touche `Echap`:

![Annuler](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_paste_cancel.png?raw=true)

Et voilà!

![Collé!](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_pasted.png?raw=true)

### Manipuler les rangées

Au cours de l'édition de votre planche d'étiquette, il peut parfois être utile d'insérer et/ou de supprimer une rangée.

Pour insérer une rangée, cliquez sur le raccourci présent entre chacune des rangées existantes:

![Insérer une rangée](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_add_row.png?raw=true)

Pour supprimer une rangée, cliquez sur l'icône `Corbeille`, à gauche du nom de la rangée souhaitée:

![Supprimer une rangée](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_delete_row.png?raw=true)

#### Raccourcis claviers / souris

Lors de la définition de votre planche d'étiquettes, vous pouvez utiliser votre clavier pour interagir sur les rangées
et les modules.

- Pour faire défiler les rangées verticalement, vous pouvez utiliser les flèches `haut` et `bas` de votre clavier,
  l'ascenseur de la fenêtre ou la roulette de votre souris.
- Pour faire défiler les rangées horizontalement, vous pouvez utiliser l'ascenseur de la fenêtre ou la roulette de votre
  souris (en appuyant simultanément sur une des touches `shift` de votre clavier).
- Pour déplacer un module horizontalement, sélectionnez-le avec votre souris, puis appuyez sur les flèches `gauche` et
  `droite` de votre clavier.
- Pour redimensionner un module, sélectionnez-le avec votre souris, puis appuyez sur les touches `+` et `-` de votre
  clavier.

> <b>🛈 Bon à savoir</b>
>
> ![Auto ID](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_auto_id.png?raw=true)
>
> A tout moment, vous pouvez ré-assigner l'ensemble des identifiants votre projet en cliquant sur ce bouton (accessible
> dans l'onglet ```Éditeur``` et ```Schéma```.

## Édition d'un module

Après avoir cliqué sur le symbole d'édition d'un module, une fenêtre popup s'ouvre et vous offre la possibilité d'
affiner sa définition.

La partie inférieure de la fenêtre d'édition comporte une zone de démonstration, mettant en scène vos modifications en
temps réel.

![Édition d'un module](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_popup.png?raw=true)

- _Identifiant_ : Identifiant technique du module. Seules les lettres, chiffres et le caractère point sont acceptés.
- _Libellé_ : Une très courte description du module. Les retours à la ligne sont pris en compte.
- _Pictogramme_ : Une petite image illustrant l'environnement du module.

> <b>🛈 Bon à savoir</b>
>
> ![Auto Next ID](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_next_id.png?raw=true)
>
> Il est parfois difficile de suivre les identifiants déjà utilisés par les précédents modules, c'est pourquoi un bouton
> est à votre disposition pour trouver automatiquement le dernier identifiant libre correspondant à la fonction du module
> définie dans l'onglet ```Schéma```.

### Les actions disponibles

- **Supprimer**: Permet de libérer un module. Supprime toutes les données liées à ce module.
- **Annuler**: Annule les modifications en cours
- **Valider**: Accepter et appliquer les modifications en cours

### Les pictogrammes

Une liste de pictogrammes vous est proposée.

![Liste des pictogrammes](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_icon_selector.png?raw=true)

Par ailleurs, vous pouvez aussi rechercher un picto, directement en écrivant une partie de sa description. La liste se
mettra automatiquement à jour.

![Rechercher un pictogramme](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_icon_selector_search.png?raw=true)

### Les groupes

Il est parfois plus simple de regrouper les modules par pièces ou par zones par exemple. Pour ce faire, l'application vous propose de définir une couleur de groupe.

![Définir une couleur](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_popup_color.png?raw=true)

Cette couleur pourra être affichée sur les étiquettes en fonction de la définition du thème sélectionné. Bien évidement, vous pouvez ajuster cet affichage en modifiant les paramètres du thème en cours ou créer votre propre thème !

![Choisir une couleur](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_custom_editor_color.png?raw=true)

## Décorer ses étiquettes

![Sélection du thème](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_selector.png?raw=true)

A chacun son style, à chaque coffret sa marque, quoi de mieux que de pouvoir décorer ses étiquettes au style de la
marque du matériel installé?

Sélectionnez le thème de votre choix puis admirez le style de vos étiquettes changez en temps réel!

![Sélection du thème](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_selector2.png?raw=true)

- Thème Simple

![Thème Simple](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_simple.png?raw=true)

- Thème Minimal

![Thème Minimal](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_minimal.png?raw=true)

- Thème Schneider - Standard

![Thème Schneider - Standard](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_schn_std.png?raw=true)

- Thème Schneider - Alternatif

![Thème Schneider - Alternatif](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_schn_alt.png?raw=true)

- Thème Schneider - Nouveau format - Logements

![Thème Schneider - Nouveau format - Logements](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_schn_lgt.png?raw=true)

- Thème Schneider - Nouveau format - Tertiaire

![Thème Schneider - Nouveau format - Tertiaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_schn_ter.png?raw=true)

- Thème Hager - Ancien format - Logements

![Thème Hager - Ancien format - Logements](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_hgr_algt.png?raw=true)

- Thème Hager - Ancien format - Tertiaire

![Thème Hager - Ancien format - Tertiaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_hgr_ater.png?raw=true)

- Thème Hager - Nouveau format - Logements

![Thème Hager - Nouveau format - Logements](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_hgr_nlgt.png?raw=true)

- Thème Hager - Nouveau format - Tertiaire

![Thème Hager - Nouveau format - Tertiaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_hgr_nter.png?raw=true)

- Thème Legrand - Monochrome - Logements

![Thème Legrand - Monochrome - Logements](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_lgd_mlgt.png?raw=true)

- Thème Legrand - Monochrome - Tertiaire

![Thème Legrand - Monochrome - Tertiaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_lgd_mter.png?raw=true)

- Thème Legrand - Couleur - Logements

![Thème Legrand - Couleur - Logements](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_lgd_clgt.png?raw=true)

- Thème Legrand - Couleur - Tertiaire

![Thème Legrand - Couleur - Tertiaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_lgd_cter.png?raw=true)

### Personnaliser la décoration

Tiquettes vous propose de décorer plus finement vos étiquettes en créant votre propre thème!

![Thème personnalisé](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_custom_button.png?raw=true)

![Thème personnalisé](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_theme_custom_editor.png?raw=true)

Vous pouvez exporter vos thèmes, et même importer les créations d'autrui !

### Bibliothèque de thèmes

Tiquettes.fr propose une bibliothèque de thèmes que vous pouvez importer pour personnaliser vos étiquettes. Rendez-vous
à la [bibliothèque](https://www.tiquettes.fr/themes.php) pour découvrir et télécharger les créations artistiques proposées ;-)

## Schéma unifilaire

### Édition des caractéristiques

Depuis la version 2.0.0, Tiquettes propose la génération semi-automatique d'un schéma unifilaire représentatif du
tableau électrique conçu par vos soins.

La fenêtre d’édition d'un module possède désormais un nouvel onglet ```Schéma``` permettant de définir les
caractéristiques techniques du module:

![Édition des caractéristiques techniques](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_popup_schema.png?raw=true)

- _Fonction_ : Fonction technique du module : Interrupteur différentiel, Disjoncteur, etc.
- _Parent_ : Module parent dont dépend le module en cours d'édition. Par exemple, ce disjoncteur dépend d'un module
  Interrupteur différentiel.

Les autres informations sont dynamiquement adaptées à la fonction choisie précédemment.

La zone de démonstration affiche la représentation graphique (Symbole) et les caractéristiques techniques telles
qu'elles seront incluses dans le schéma unifilaire global.

#### L'asservissement

Les propriétés d'un module propose de définir par quel contacteur un module peut être asservi.

Prenons un exemple concret:

Je souhaite alimenter une ampoule qui devra être commandée par un télérupteur. Donc nous allons ajouter un module de type disjoncteur 2A pour protéger la bobine du télérupteur, un disjoncteur 10A pour protéger le circuit d'éclairage qui sera piloté par les contacts du télérupteur, et le télérupteur, lui même.

Voici un schéma résumé:

![Asservissement simple](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_schema_asserv_simple.png?raw=true)

Le disjoncteur Q1 protège la bobine du télérupteur KC1. Le disjoncteur Q2 protège l'éclairage couloir, le télérupteur KC1 asservi le disjoncteur Q2.

![Asservissement simple - Propriétés](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_props_asserv_simple.png?raw=true)

Vous remarquerez le choix du type d'asservissement. Dans notre exemple, le disjoncteur Q2 ne protège que le circuit 'Eclairage couloir', donc c'est un asservissement total.

Autre exemple. Nous souhaitons que le disjoncteur Q2 protège aussi le circuit d'éclairage Salon.

![Asservissement double](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_schema_asserv_double.png?raw=true)

Pour ce faire, dans les propriétés du disjoncteur Q2, nous remplaçons le libellé 'Couloir' par 'Salon' puis dans les propriétés du schéma, nous indiquons un asservissement partiel.

![Asservissement double - Propriétés](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_props_asserv_double.png?raw=true)

Et voila! La magie de Tiquettes.fr à encore opérée. :-)


### Génération du schéma unifilaire

La génération dépend à 100% des données que vous aurez renseignées lors de l'édition d'un module.

Le schéma généré en temps réel est accessible via l'onglet ```Schéma``` du tableau de bord :

![Schéma unifilaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_schema.png?raw=true)

> <b>🛈 Bon à savoir</b>
>
> ![Auto ID](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_auto_id.png?raw=true)
>
> A tout moment, vous pouvez ré-assigner l'ensemble des identifiants votre projet en cliquant sur ce bouton (accessible
> dans l'onglet ```Éditeur``` et ```Schéma```.


Pour éditer un module, il suffit juste de cliquer dessus ;-)

![Schéma unifilaire](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_schema_editor.png?raw=true)

Au-dessus du schéma vous retrouverez l'espace ```barre à outils``` vous proposant dans cet onglet, différents réglages.

Pour commencer, vous avez la possibilité d'ajouter un ```Disjoncteur de branchement``` à votre schéma. Vous pouvez
l'activer ou le désactiver en utilisant cette
icône ![Disjoncteur de branchement](https://github.com/pantaflex44/Tiquettes/blob/main/docs/_icon_db.svg?raw=true).
Différents réglages sont disponibles pour s'adapter au mieux à votre besoin.

S'ensuit la possibilité, via un clic sur cette
icône ![Bornier de terre](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_icon_ground.svg?raw=true),
d'ajouter un bornier / ligne de terre au schéma.

L'icône ![Moniteur](https://github.com/pantaflex44/Tiquettes/blob/main/docs/_icon_monitor.svg?raw=true) permet d'activer
ou non le <a href="#moniteur-de-surveillance">Moniteur de surveillance</a>.

## Moniteur de surveillance

Certains onglets, se voient ajouté dans leur barre à outils, un bouton d'activation du moniteur de
surveillance ![Moniteur](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_icon_monitor.svg?raw=true).

Depuis la version 2.0.0 de l'application, Tiquettes vous propose une relative détection des erreurs dans votre projet.
Ces "erreurs", correspondent à des règles définies dans la norme NFC 15-100 à l'instant T. Vous pouvez bien évidement
désactiver cette surveillance à tout moment.

![Surveillance - Aucun problème détecté](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_monitor_ok.png?raw=true) ![Surveillance - Erreur détectés](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_monitor_errors.png?raw=true)

Le moniteur surveillera l'application des règles suivantes (NFC 15-100 09/2024) :

- ```Étiquettes```: Le respect du minimum de 20% d'espace libre dans l'enveloppe du tableau.
- ```Schéma```: Le nombre de circuits associés à un interrupteur différentiel : 8 (sauf pour le tertiaire).
- ```Schéma```: Le nombre minimum d'interrupteurs différentiels : 2.
- ```Schéma```: Le type de protection différentielle parente pour les circuits Plaque de cuisson, Chauffages et
  Bornes/Prises de recharge : Type A.
- ```Schéma```: Le calibre de l'interrupteur sectionneur en fonction du calibre du disjoncteur de branchement (si ajouté
  au schéma).
- etc.

![Surveillance - Exemple d'erreur](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_monitor_errors_details.png?raw=true)

La surveillance, lors de la conception de votre projet, s'améliorera avec le temps et de nouvelles règles s'ajouteront
au fur et à mesure des prochaines versions!

## Nomenclature / Résumé

Tiquettes vous propose de résumer votre projet.

La nomenclature est générée automatiquement en fonction des définitions indiquées dans l'éditeur.

![Nomenclature](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_summary.png?raw=true)

La barre à outils regroupe cette fois, la liste des colonnes que vous souhaitez afficher. Ce paramètre est
automatiquement associé à votre projet, ce qui signifie qu'il sera, lui aussi, exporté.

## Immortaliser son travail

![Immortaliser](https://raw.githubusercontent.com/pantaflex44/Tiquettes/refs/heads/main/docs/_actions.png?raw=true)

Une fois vos étiquettes réalisées, vous pourrez les imprimer en cliquant sur le bouton adéquat.

Le mode `paysage` ainsi que le format A4 sont sélectionnés par défaut.

> <b>🛈 Bon à savoir</b>
>
> Depuis la version 2.2.0, **Tiquettes vous propose l'impression en PDF de vos projets**. Imprimer en PDF permet
> d'améliorer nettement la qualité de la mise en page de votre projet. Par ailleurs, imprimer en PDF permet de passer
> outre les manquements et problèmes provoqués par certains navigateurs qui ne respectent pas forcément toutes les
> possibilités du rendu proposé par Tiquettes.
>
> **Imprimer en PDF nécessite d'être vigilant au niveau des propriétés de votre imprimante. Veillez à bien
sélectionner "Taille réelle" ou "Echelle 100%" pour respecter la mise en page proposée par l'application.**

### Fin!

---

# Remerciements ❤ !

Au travers vos utilisations de Tiquettes, vous n'hésitez pas à me remonter des bugs, proposer de nouvelles idées, et vous m'offrez un café donc je vous en remercie fortement pour tout celà !

### 🐛 Remontées de [BUGS](https://github.com/pantaflex44/Tiquettes/issues?q=is%3Aissue) (les [issues](https://github.com/pantaflex44/Tiquettes/issues?q=is%3Aissue)) , et les [Discussions](https://github.com/pantaflex44/Tiquettes/discussions)

- [zoliaaz](https://github.com/zoliaaz),
- [cnaslain](https://github.com/cnaslain)
- [ntarocco](https://github.com/ntarocco)
- [jlecour](https://github.com/jlecour)
- [plouflechien](https://github.com/plouflechien)
- [Benoit485](https://github.com/Benoit485)
- [F4FXL](https://github.com/F4FXL)
- [dough29](https://github.com/dough29)
- [karimLG](https://github.com/karimLG)
- [fmdl](https://github.com/fmdl)
- [ekozan](https://github.com/ekozan)
- [Starlight58](https://github.com/Starlight58)
- [Trinakria23](https://github.com/Trinakria23)
- [Boubigloubi](https://github.com/Boubigloubi)
- [martinlbb](https://github.com/martinlbb)
- [rems64](https://github.com/rems64)

 ### ☕ Ainsi que pour tous les cafés offerts ;-)