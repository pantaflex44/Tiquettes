# Tiquettes

Générateur d'étiquettes pour tableaux / armoires électriques.

---

https://pantaflex44.github.io/Tiquettes/


<u>Licence</u>: MIT<br />
<u>Auteur</u>: Christophe LEMOINE <pantaflex (at) hotmail (dot) fr><br />
<u>Création</u>: 26/05/2024<br />

---

![Tiquettes](docs/_sample.png)

## Le projet

Tout commence par l'initialisation de son projet.

Deux possibilités:

- Créer un nouveau projet
- Importer un projet sauvegarder


### Créer un nouveau projet par défaut

![Nouveau projet](docs/_new_project.png)

L'application définit automatiquement un tableau électrique de 4 rangées, 13 modules par rangée avec une hauteur des étiquettes de 30mm.

Bien évidement vous pouvez modifier ces valeurs en agissant sur les réglages proposés. Commencez par le réglage du nombre de modules, puis de rangées, et finissez avec la hauteur des étiquettes.

Le tableau s'ajustera automatiquement.

### Importer un projet sauvegardé

![Importer un projet](docs/_import.png)

Tiquettes vous propose d'importer et d'exporter votre travail pour l'archiver ou y retravailler ultérieurement. Une sauvegarde automatique de votre session de travail est aussi intégrée au système.

Pour importer un projet, cliquez sur le bouton ```Choisir un fichier``` puis chargez le fichier correspondant à votre projet. Immédiatement, celui-ci s'affichera plus bas!

## Utilisation

### Descriptif

Un tableau peut comporter de 1 à 15 rangées, 13, 18 ou 24 modules par rangée.

Chaque module peut avoir une largeur et/ou une position réglable en fonction de la place disponible autour de lui. Vous pourrez l'étendre jusqu'à rencontrer, soit le bout de la rangée, soit un autre module déja défini. Vous devrez libérer celui-ci pour pousuivre son expansion. Idem pour le déplacer, seulement possible dans les espaces libres.

### Menu contextuel du haut

![Menu contextuel du haut](docs/_top.png)

Le symbole ```+``` vous permet d'agrandir le module d'une largeur sur sa droite.

Le symbole ```-``` vous permet de réduire le module d'une largeur.

Le symbole ```←``` vous permet de déplacer le module d'une position sur la gauche.

Le symbole ```→``` vous permet de déplacer le module d'une position sur la droite.

### Menu contextuel du bas

![Menu contextuel du bas](docs/_bottom.png)

Le symbole ```Corbeille``` (ou la touche ```Suppr``` du clavier) permet de libérer le module. Il perdra son identifiant, son icône, et sa définition mais conservera sa taille. Il pourra donc de nouveau être englobé dans l'agrandissement des modules précédents.

Le symbole ```Crayon``` (ou la touche ```Entrée``` du clavier) permet d'éditer le module en question.

### Manipuler les rangées

Au cours de l'édition de votre planche d'étiquette, il peut parfois être utile d'insérer et/ou de supprimer une rangée.

Pour insérer une rangée, cliquez sur le raccourci présent entre chacune des rangées éxistantes:

![Insérer une rangée](docs/_add_row.png)

Pour supprimer une rangée, cliquez sur l'icone ```corbeille```, à gauche du nom de la rangée souhaitée:

![Supprimer une rangée](docs/_delete_row.png)


### Raccourcies claviers / souris

Lors de la définition de votre planche d'étiquettes, vous pouvez utiliser votre clavier pour interagir sur les rangées et les modules.

- Pour faire défiler les rangées verticalement, vous pouvez utiliser les flèches ```haut``` et ```bas``` de votre clavier, l'ascenseur de la fenètre ou la roulette de votre souris.
- Pour faire défiler les rangées horizontalement, vous pouvez utiliser l'ascenseur de la fenètre ou la roulette de votre souris (en appuyant simultanement sur une des touches ```shift``` de votre clavier).
- Pour déplacer un module horizontalement, sélectionnez le avec votre souris, puis appuyez sur les flèches ```gauche``` et ```droite``` de votre clavier.
- Pour redimensionner un module, sélectionnez le avec votre souris, puis appuyez sur les touches ```+``` et ```-``` de votre clavier.


## Edition d'un module

Après avoir cliqué sur le symbole d'édition d'un module, une fenêtre popup s'ouvre et vous offre la possibilité d'affiner sa définition.

![Edition d'un module](docs/_popup.png)

- *Identifiant* : Identifiant technique du module. Seules les lettres, chiffres et le caractère point son acceptés.
- *Description* : Une très courte description du module. Les retours à la ligne sont pris en compte.
- *Pictogramme* : Une petite image illustrant l'environement du module.

## Décorer ses étiquettes

![Sélection du thème](docs/_theme_selector.png)

A chacun son style, à chaque coffret sa marque, quoi de mieux que de pouvoir décorer ses étiquettes au style de la marque du matériel installé?

Sélectionnez le thème de votre choix puis admirez le style de vos étiquettes changez en temps réel!

- Thème Simple

![Thème Simple](docs/_theme_simple.png)

- Thème Minimal

![Thème Minimal](docs/_theme_minimal.png)

- Thème Schneider - Standard

![Thème Schneider - Standard](docs/_theme_schn_std.png)

- Thème Schneider - Alternatif

![Thème Schneider - Alternatif](docs/_theme_schn_alt.png)

- Thème Schneider - Nouveau format - Logements

![Thème Schneider - Nouveau format - Logements](docs/_theme_schn_lgt.png)

- Thème Schneider - Nouveau format - Tertiaire

![Thème Schneider - Nouveau format - Tertiaire](docs/_theme_schn_ter.png)

- Thème Hager - Ancien format - Logements

![Thème Hager - Ancien format - Logements](docs/_theme_hgr_algt.png)

- Thème Hager - Ancien format - Tertiaire

![Thème Hager - Ancien format - Tertiaire](docs/_theme_hgr_ater.png)

- Thème Hager - Nouveau format - Logements

![Thème Hager - Nouveau format - Logements](docs/_theme_hgr_nlgt.png)

- Thème Hager - Nouveau format - Tertiaire

![Thème Hager - Nouveau format - Tertiaire](docs/_theme_hgr_nter.png)

- Thème Legrand - Monochrome - Logements

![Thème Legrand - Monochrome - Logements](docs/_theme_lgd_mlgt.png)

- Thème Legrand - Monochrome - Tertiaire

![Thème Legrand - Monochrome - Tertiaire](docs/_theme_lgd_mter.png)

- Thème Legrand - Couleur - Logements

![Thème Legrand - Couleur - Logements](docs/_theme_lgd_clgt.png)

- Thème Legrand - Couleur - Tertiaire

![Thème Legrand - Couleur - Tertiaire](docs/_theme_lgd_cter.png)

## Immortaliser son travail

![Immortaliser](docs/_actions.png)

Une fois vos étiquettes réalisées, vous pourrez les imprimer en cliquant sur le bouton adéquat.

Sélectionnez le mode ```paysage``` pour simplifier la mise en page.

Choisissez d'imprimer le fond et les images pour avoir un rendu tel votre écran.

## Fin!