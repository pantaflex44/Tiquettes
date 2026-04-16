# Analyse technique complète du projet **Tiquettes**

## 1) Résumé exécutif

- Le projet combine un frontend React/Vite et un backend PHP exposé publiquement sous `public/api/*`.
- Le produit est fonctionnel mais présente des **risques de production** concentrés sur : sécurité API, robustesse opérationnelle, et dette structurelle (gros fichiers monolithiques).
- Les priorités critiques (P0) sont :
  1. durcir les endpoints API (CORS, validation entrées, exposition d’erreurs),
  2. sortir la configuration sensible de la logique runtime,
  3. réduire les points de défaillance dans les scripts de release.

---

## 2) Périmètre audité

### Frontend
- `src/main.jsx`
- `src/App.jsx`
- `src/SchemaTab.jsx`
- `src/ThemeEditorPopup.jsx`
- `src/Editor.jsx`
- `src/ThemeEngine.jsx`
- `public/api/stats.js`
- `vite.config.js`

### Backend (PHP)
- `public/api/libs/config.php`
- `public/api/stats.php`
- `public/api/visit.php`
- `public/api/action.php`
- `public/api/choices.php`
- `public/api/resume.php`
- `public/api/reports.php`
- `public/api/toPdf.php`
- `public/api/myip.php`

### Build / release
- `package.json`
- `app-config.json`
- `app-config-compiler.cjs`

### Inconnu / Risque (non visible)
- `public/api/libs/constants.<mode>.php` : fichiers requis dynamiquement mais absents du repo.
- Schéma SQL complet (tables, index, contraintes) : non fourni.
- Infra de déploiement (reverse proxy, WAF, rate limiting, logs, backup) : non fournie.

---

## 3) Cartographie architecture

## 3.1 Frontend
- SPA React 19 + Vite 7.
- État applicatif principalement local (hooks, sessionStorage/localStorage selon usage).
- Fichier central `App.jsx` très volumineux (2 415 lignes) : orchestration UI, état métier, impression, import/export, monitor.

## 3.2 Backend
- Endpoints PHP procéduraux, sans framework.
- Chargement central via `libs/config.php` (CORS, timezone, DB, helpers, SMTP, IP/UA).
- Fonctions “stats” alimentées par endpoints publics (`visit.php`, `action.php`, `choices.php`).
- Génération PDF intégrée dans `toPdf.php` (1 596 lignes), basée sur FPDF + dépendance Imagick/convert.

## 3.3 Couplage
- Fort couplage frontend ↔ API stats via `public/api/stats.js`.
- Fort couplage backend ↔ base SQL avec création de tables dynamique en runtime selon la nomenclature d’actions/choix.

---

## 4) Constats détaillés (fiabilité, sécurité, maintenabilité)

## 4.1 Sécurité (priorité haute)

### A. CORS permissif et incohérent
- Plusieurs endpoints envoient `Access-Control-Allow-Origin: *` **et** `Access-Control-Allow-Credentials: true`.
- Ce couple est incorrect selon les navigateurs et ouvre des comportements non maîtrisés.
- Impact : exposition API large, surface d’attaque augmentée.

**Action recommandée (P0)**
- Restreindre l’origine aux domaines autorisés explicites.
- Supprimer `Allow-Credentials` si wildcard requis.

### B. Exposition d’erreurs internes
- `config.php` active `display_errors=1` + `E_ALL`.
- En cas d’erreur PDO, message brut renvoyé (`dd_json($e->getMessage())`).
- Impact : fuite d’informations système (structure SQL, chemins, etc.).

**Action recommandée (P0)**
- Désactiver l’affichage d’erreurs en prod.
- Logger côté serveur, renvoyer message générique côté client.

### C. Entrées non durcies sur endpoints publics
- Paramètres GET utilisés massivement (`m`, `s`, `a`, `c`, `k`, `ip`, `ua`, `rfr`, `prt`) avec validation partielle.
- `CLIENT_IP` peut venir de query (`?ip=`) : falsifiable.
- `HTTP_X_FORWARDED_FOR` brut potentiellement multi-IPs non normalisé.

**Action recommandée (P0)**
- Introduire un validateur central (allowlist stricte par clé).
- Ne jamais faire confiance à `ip` query en production publique.

### D. Dépendance HTTP non chiffrée
- `visit.php` appelle `http://ip-api.com/json/...` en clair.
- Impact : MITM possible, blocages réseau, latence et défaillance externe.

**Action recommandée (P1)**
- Passer en HTTPS si API supportée.
- Ajouter timeout court + fallback silencieux.

### E. Surface d’attaque “stats write” ouverte
- `visit/action/choices` sont accessibles publiquement et écrivent en base.
- Sans rate limit visible ni authentification.
- Impact : pollution de métriques, amplification de charge DB, abuse potentiel.

**Action recommandée (P0/P1)**
- Rate limiting en edge/proxy (IP + UA).
- Token anonyme signé côté frontend (optionnel) pour réduire spam trivial.

---

## 4.2 Robustesse et performance

### A. Monolithes applicatifs
- `src/App.jsx` (2 415 lignes), `public/api/toPdf.php` (1 596 lignes), `public/api/myip.php` (1 046 lignes).
- Risque : effet domino, forte difficulté de test, revue et correction.

**Action recommandée (P1)**
- Découpage par domaines :
  - `App.jsx` → hooks métier (`useProjectState`, `usePrintOptions`, `useClipboardOps`), composants conteneurs.
  - `toPdf.php` → services orientés pages (cover, labels, schema, summary).

### B. N+1 queries et complexité analytique
- `reports.php` réalise de multiples boucles imbriquées + requêtes répétées.
- Coût potentiellement élevé quand les volumes stats augmentent.

**Action recommandée (P1)**
- Pré-agréger en SQL (`GROUP BY`) et réduire les requêtes par structure/action.
- Ajouter index dédiés (inconnu/risk sans schéma SQL).

### C. UUID maison non standard
- `generateUUID` basé sur `Math.random`.
- Non cryptographique, collisions improbables mais possibles.

**Action recommandée (P2)**
- Remplacer par `crypto.randomUUID()` côté navigateur moderne.

### D. Build script non déterministe
- `app-config-compiler.cjs` utilise `fs.writeFile` async sans orchestration.
- Risque de séquencement non garanti dans certains contextes CI.

**Action recommandée (P1)**
- Migrer vers `fs.writeFileSync` (script court) ou promesses `await`.

---

## 4.3 Maintenabilité / architecture

### A. Mélange des responsabilités dans `config.php`
- Mail, CORS, DB, timezone, sécurité, helpers, génération de noms… tout est centralisé.
- Risque : couplage excessif et side-effects globaux.

**Action recommandée (P1)**
- Scinder en modules :
  - `bootstrap/http.php`
  - `bootstrap/db.php`
  - `security/input.php`
  - `support/helpers.php`

### B. Dépendances vendorisées dans `public/api/libs`
- Librairies tierces commitées directement (FPDF, PHPMailer, JWT).
- Risque : mises à jour de sécurité manuelles, drift de version.

**Action recommandée (P2)**
- Introduire `composer.json` pour backend PHP.
- Garder un process de patch sécurité reproductible.

### C. Couche test absente
- Aucun jeu de tests visible (unitaires/intégration) côté JS/PHP.
- Risque : régressions silencieuses sur fonctionnalités critiques (impression, schéma, import).

**Action recommandée (P1/P2)**
- Cibler des tests à forte valeur :
  - parser/validation projet importé,
  - moteur de calcul monitor (extraits de `SchemaTab.jsx`),
  - génération PDF smoke test (API retourne PDF valide).

---

## 5) Analyse sécurité ciblée par thème

## 5.1 Secrets
- **Inconnu / Risque** : fichier `constants.<mode>.php` absent; impossible de confirmer la gestion des secrets (DB, SMTP).
- Risque élevé si secrets stockés en clair et versionnés.

**Mesure attendue**
- Secrets injectés via variables d’environnement (ou secret manager), jamais en dépôt.

## 5.2 Validation d’entrées
- Validation partielle et dispersée.
- Pas de schéma central de validation.

**Mesure attendue**
- Schéma d’entrée strict par endpoint (tailles max, enums, regex, normalisation).

## 5.3 Injection
- SQL: usage de `prepare/execute` correct dans la majorité des cas.
- Risque résiduel sur concaténation de noms de table dynamiques (même si issus de listes autorisées DB).

**Mesure attendue**
- Consolidation des noms de table via mapping interne constant + tests de garde.

## 5.4 Données personnelles
- Collecte IP, UA, referrer, géolocalisation.
- **Inconnu / Risque** conformité RGPD (base légale, durée de conservation, minimisation, anonymisation).

**Mesure attendue**
- Politique de conservation + anonymisation IP + information claire utilisateur.

---

## 6) Roadmap actionnable (production-first)

## P0 – immédiat (sécurité/fiabilité)
1. Durcir CORS : origine allowlist explicite, cohérence credentials.
2. Désactiver erreurs détaillées en prod, ajouter logging serveur.
3. Introduire validation centralisée des paramètres GET (allowlist stricte).
4. Bloquer l’override IP via query en prod.
5. Mettre un rate limiting edge sur `/api/visit.php`, `/api/action.php`, `/api/choices.php`.

## P1 – court terme
1. Refactor `App.jsx` en hooks métier + composants dédiés.
2. Refactor `toPdf.php` en modules orientés responsabilité.
3. Optimiser `reports.php` (agrégations SQL, moins de boucles/requêtes).
4. Rendre `app-config-compiler.cjs` déterministe (write sync/await).
5. Isoler bootstrap backend en fichiers spécialisés.

## P2 – moyen terme
1. Passer backend sur Composer pour dépendances tierces.
2. Ajouter tests ciblés (pas de sur-couverture inutile).
3. Basculer UUID sur `crypto.randomUUID`.
4. Structurer un contrat API versionné (OpenAPI minimal).

---

## 7) Propositions concrètes de refactoring (sans rupture)

## 7.1 Frontend – découpage minimal de `App.jsx`
- Créer :
  - `src/hooks/useProjectState.js`
  - `src/hooks/usePrintOptions.js`
  - `src/hooks/useClipboard.js`
  - `src/services/importExport.js`
- Garder `App.jsx` comme orchestrateur visuel uniquement.

Bénéfices : lisibilité, testabilité, réduction du couplage.

## 7.2 Backend – validation centralisée
- Créer `public/api/libs/input.php` :
  - `getEnumParam(string $name, array $allowed, ?string $default): string`
  - `getStringParam(string $name, int $maxLen, string $default=''): string`
  - `getBoolParam(string $name, bool $default=false): bool`
- Remplacer l’accès direct `$_GET` dans `visit/action/choices/reports/resume`.

Bénéfices : surface d’erreur réduite, sécurité homogène.

## 7.3 Observabilité minimale
- Ajouter logs structurés JSON pour erreurs API (corrélation par request id).
- Ajouter métrique de latence p95/p99 sur endpoints PDF.

Bénéfices : diagnostic incident réaliste en production.

---

## 8) Points bloquants / inconnus critiques

1. Fichiers `constants.<mode>.php` absents : impossible d’auditer la gestion réelle des secrets et flags runtime.
2. Schéma DB absent : impossible de valider index/contraintes/perf SQL.
3. Pipeline CI/CD non visible : impossible de vérifier contrôles qualité avant déploiement.

---

## 9) État final recommandé

À l’issue des actions P0+P1, le projet peut atteindre un niveau “production robuste” avec :
- API durcie et observable,
- architecture moins monolithique,
- scripts de build déterministes,
- premiers tests à forte valeur métier.

Le produit conservera son comportement fonctionnel existant tout en réduisant fortement le risque d’incident et le coût de maintenance.
