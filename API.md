# Tiquettes.fr, Documentation de l'API


## Manipulation de l'application

### Lance l'application et ouvre la boite de dialogue de bienvenue

```GET https://www.tiquettes.fr/app/?enjoy```


### Lance l'application et ouvre la boite de dialogue "nouveau projet"

```GET https://www.tiquettes.fr/app/?new[&OPTIONS]```

> <u>Les options</u> :
> - *t=**Nouveau%20projet***    : Titre du nouveau projet 
> - *r=**4***                   : Nombre de rangées (1 à 15)
> - *s=**13***                  : Nombre de modules par rangée (13, 18 ou 24)
> - *h=**29***                  : Hauteur en mm de chaque rangée (10 à 100 mm)
>
> <u>eg</u>: https://www.tiquettes.fr/app/?new&t=Nouveau%20projet&r=4&s=13&h=29


### Importer un projet depuis une source extérieure

```GET https://www.tiquettes.fr/app/?import&data={$DATA}```

> *{$DATA}* : Fichier JSON d'un projet, encodé en BASE64


### Imprimer un projet depuis une source extérieure

```GET https://www.tiquettes.fr/app/?print&data={$DATA}[&OPTIONS]```

> *{$DATA}* : Fichier JSON d'un projet, encodé en BASE64

> <u>Les options</u> :
> - *fp=[**true**|false]*           : Imprimer la page de garde 
> - *fm=[true|**false**]*           : Décorer les modules libres
> - *vl=[**true**|false]*           : Imprimer les étiquettes
> - *vh=[true|**false**]*           : Imprimer le schéma unifilaire
> - *vs=[true|**false**]*           : Imprimer la nomenclature
> - *ap=[true|**false**]*           : Ouvrir les propriétés d'impression
> - *lcl=[**true**|false]*          : Indiquer les lignes de coupes
> - *pc=[true|**false**]*           : Indiquer les guides d'installation
> - *lpf=[**A4**|A3]*               : Format papier des étiquettes
> - *hpf=[**A4**|A3]*               : Format papier du schéma unifilaire
> - *spf=[**A4**|A3]*               : Format papier de la nomenclature
>
> <u>eg</u>: https://www.tiquettes.fr/app/?print&data={$DATA}&fp=true&fm=false&vl=true&vh=false&vs=false&ap=false&lcl=true&pc=false&lpf=A4&hpf=A4&spf=A4
