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

![Nouveau projet](docs/_project_actions1.png)

### Créer un nouveau projet par défaut

![Nouveau projet](docs/_new_project.png)

L'application définie automatiquement un tableau électrique de 4 rangées, 13 modules par rangée avec une hauteur des étiquettes de 30mm.

Bien évidement vous pouvez modifier ces valeurs en agissant sur les réglages proposés. Commencez par le réglage du nombre de modules, puis de rangées, et finissez avec la hauteur des étiquettes.

Le nouveau tableau s'ajustera automatiquement.

### Importer un projet sauvegardé

Tiquettes vous propose d'importer et d'exporter votre travail pour l'archiver ou y retravailler ultérieurement. Une sauvegarde automatique de votre session de travail est aussi intégrée au système.

Pour importer un projet, cliquez sur le bouton `Importer` puis chargez le fichier correspondant à votre projet. Immédiatement, celui-ci s'affichera dans la zone de travail!

### Résumé du projet

Une fois le projet chargé, vous retrouverez un résumé de ses propriétés au dessus de la zone de travail.

![Nouveau projet](docs/_project_resume.png)

En premier, se regroupe le nom donné au projet ainsi que la version d'exportation. Cette version se met automatiquement à jour au moment de chaque exportation.

> <b>🛈 Bon à savoir</b>
>
> Pour modifier le nom du projet, cliquez dessus puis validez les modifications avec la touche `Entrée` de votre clavier. A contrario, la touche `Echap` annule les modifcations.
>
> ![Modifier le nom du projet](docs/_edit_project_name.png)

Puis, vous retrouvez les dates de travail ainsi que le descriptif technique.

## L'éditeur

### Descriptif

Un tableau peut comporter de 1 à 15 rangées, 13, 18 ou 24 modules par rangée.

Chaque module peut avoir une largeur et/ou une position réglable en fonction de la place disponible autour de lui. Vous pourrez l'étendre jusqu'à rencontrer, soit le bout de la rangée, soit un autre module déja défini. Vous devrez libérer celui-ci pour pousuivre son expansion. Idem pour le déplacer, seulement possible dans les espaces libres.

### Menu contextuel du haut

![Menu contextuel du haut](docs/_top.png)

Le symbole `+` vous permet d'agrandir le module d'une largeur sur sa droite.

Le symbole `-` vous permet de réduire le module d'une largeur.

Le symbole `←` vous permet de déplacer le module d'une position sur la gauche.

Le symbole `→` vous permet de déplacer le module d'une position sur la droite.

### Menu contextuel du bas

![Menu contextuel du bas](docs/_bottom.png)

Le symbole `Crayon` (ou la touche `Entrée` du clavier) permet d'éditer le module en question.

#### Copier / Coller

Le symbole suivant permet de copier le module. Celà permet de copier, le libellé, le pictogramme et la description du module pour le duppliquer ailleurs sur le tableau. Une fois le module mis dans le presse papier, l'application vous met en avant les emplacements disponibles en fonction de la largeur initiale du module copié.

![Copier](docs/_copy.png)

Exemple d'emplacements disponibles:

![Coller aux emplacements disponibles](docs/_pasteall.png)

Cliquer sur le bouton pour duppliquer le module à cet emplacement:

![Coller](docs/_paste.png)

Pour annuler, soit, cliquer sur l'icône ci-dessous, soit appuyer sur la touche `Echap`:

![Annuler](docs/_paste_cancel.png)

Et voilà!

![Collé!](docs/_pasted.png)


### Manipuler les rangées

Au cours de l'édition de votre planche d'étiquette, il peut parfois être utile d'insérer et/ou de supprimer une rangée.

Pour insérer une rangée, cliquez sur le raccourci présent entre chacune des rangées éxistantes:

![Insérer une rangée](docs/_add_row.png)

Pour supprimer une rangée, cliquez sur l'icone `Corbeille`, à gauche du nom de la rangée souhaitée:

![Supprimer une rangée](docs/_delete_row.png)

#### Raccourcies claviers / souris

Lors de la définition de votre planche d'étiquettes, vous pouvez utiliser votre clavier pour interagir sur les rangées et les modules.

- Pour faire défiler les rangées verticalement, vous pouvez utiliser les flèches `haut` et `bas` de votre clavier, l'ascenseur de la fenètre ou la roulette de votre souris.
- Pour faire défiler les rangées horizontalement, vous pouvez utiliser l'ascenseur de la fenètre ou la roulette de votre souris (en appuyant simultanement sur une des touches `shift` de votre clavier).
- Pour déplacer un module horizontalement, sélectionnez le avec votre souris, puis appuyez sur les flèches `gauche` et `droite` de votre clavier.
- Pour redimensionner un module, sélectionnez le avec votre souris, puis appuyez sur les touches `+` et `-` de votre clavier.

## Edition d'un module

Après avoir cliqué sur le symbole d'édition d'un module, une fenêtre popup s'ouvre et vous offre la possibilité d'affiner sa définition.

La partie inférieure de la fenètre d'édition comporte une zone de démonstration, mettant en scène vos modifications en temps réel.

![Edition d'un module](docs/_popup.png)

- _Identifiant_ : Identifiant technique du module. Seules les lettres, chiffres et le caractère point son acceptés.
- _Libellé_ : Une très courte description du module. Les retours à la ligne sont pris en compte.
- _Pictogramme_ : Une petite image illustrant l'environement du module.

### Les actions disponibles

- **Supprimer**: Permet de libérer un module. Supprime toutes les données liées à ce module.
- **Annuler**: Annule les modifications en cours
- **Valider**: Accepter et appliquer les modifications ne cours

### Les pictogrammes

Une liste de pictogrammes vous est proposée.

![Liste des pictogrammes](docs/_icon_selector.png)

Par ailleurs, vous pouvez aussi rechercher un picto, directement en écrivant une partie de sa description. La liste se mettra automatiquement à jour.

![Rechercher un pictogramme](docs/_icon_selector_search.png)

## Décorer ses étiquettes

![Sélection du thème](docs/_theme_selector.png)

A chacun son style, à chaque coffret sa marque, quoi de mieux que de pouvoir décorer ses étiquettes au style de la marque du matériel installé?

Sélectionnez le thème de votre choix puis admirez le style de vos étiquettes changez en temps réel!

![Sélection du thème](docs/_theme_selector2.png)

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

## Nomenclature / Résumé

Tiquettes vous propose de résumer votre projet.

La nomenclature est générée automatiquement en fonction des définitions indiquées dans l'éditeur.

![Nomenclature](docs/_summary.png)


## Immortaliser son travail

![Immortaliser](docs/_actions.png)

Une fois vos étiquettes réalisées, vous pourrez les imprimer en cliquant sur le bouton adéquat.

Sélectionnez le mode `paysage` pour simplifier la mise en page.

> <b>🛈 Bon à savoir</b>
>
> Choisissez d'imprimer le fond et les images pour avoir un rendu tel votre écran.
>
> Imprimez toujours en taille réelle sans ajustement de la page. Surtout valable si vous souhaitez imprimer un projet préalablement enregistré en PDF. Acrobat Reader, notamment, ajuste par défaut le document au format papier sélectionné.

## Fin!
