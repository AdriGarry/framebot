# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Présentation

Framebot est un framework Node.js (CommonJS) de domotique/robot qui tourne sur un Raspberry Pi. Une même base de code pilote plusieurs bots ; chaque bot est configuré dans `bots/<nom>/` (`odi`, `tok`). Une grande partie du code utilise du vrai matériel (GPIO via `onoff`, `mpg321`/`espeak`, Arduino en série, Rfxcom, HDMI) : la plupart des modules ne peuvent pas tourner sur un poste de dev, seuls les tests unitaires sont exécutables hors du Pi.

## Commandes

- Tests unitaires : `npm test` (mocha, en mode watch). La CI les lance une seule fois sans watch : `mocha ./src/test/unit/index.test.js` (Node 12 sur GitHub Actions).
- Un seul fichier de test : `npx mocha src/test/unit/Utils.test.js`. Attention : `index.test.js` définit `global._PATH = './../../'`, dont dépendent les modules qui requièrent `Core` ; lancer un tel fichier seul nécessite la même variable globale.
- Formatage : `npm run pretty` (Prettier : guillemets simples, pas de virgules finales, `arrowParens: avoid`, printWidth 160).
- Sur le Pi : `sh framebot` la première fois (installe `/bin/framebot`, `/bin/frb` et le service systemd), puis `framebot <nomDuBot> [debug|sleep|test|reset]`, `framebot stop`, `framebot log`, `framebot reset` (vide `tmp/`).
- Les tests d'intégration ne tournent que sur le Pi : lancer avec le paramètre `test` ; `src/index.js` exécute alors `src/test/integration/tests.js`, qui envoie de vrais flux puis redémarre en mode `ready`.

## Versionnage

**Règle : ne jamais faire de commit (ni de push).** Laisser les modifications dans l'arbre de travail ; c'est l'utilisateur qui commit lui-même. En fin de tâche, proposer un message de commit qui décrit les changements, préfixé par la version, et proposer de monter la version dans `package.json` (sans le faire sans son accord). La montée proposée doit correspondre à la nature des changements (semver) : majeure pour une rupture de compatibilité (format de flux, descripteur ou conf incompatibles, API supprimée), mineure pour une nouvelle fonctionnalité (nouveau module, nouveau flux...), patch pour une correction, un réglage ou de la documentation.

Les messages de commit sont préfixés par la version de `package.json` (ex. `7.16.4 Reduce error sound volume`) ; incrémenter la version dans `package.json` avec les changements. La CI crée automatiquement le tag sur master à partir de cette version.

## Architecture

### Démarrage du processus
`framebot` (shell) → `src/wrapper.js` → lance `src/index.js <nomDuBot> [params]`.
- Le wrapper crée `tmp/` et `log/`, valide ou réinitialise `tmp/conf.json` à partir de `data/framebotDefault.json`, et relance le Core quand il s'arrête. Après un crash, il redémarre en mode `sleep` avec des délais croissants (ou dès un appui sur le bouton « OK », GPIO 20).
- `src/index.js` définit `global._PATH` (racine du dépôt, avec slash final, utilisée partout pour les `require` absolus), charge `bots/<nom>/descriptor.json` et appelle `Core.initializeContext()`.

### Core (`src/core/`)
`Core.initializeContext` construit l'objet partagé `Core`, initialise `Observers` à partir de `descriptor.modules`, charge les modules via `ModuleLoader`, démarre le serveur, enregistre les crons des modules, puis scelle `Core`.
- `Core.conf(clé[, valeur])` : persisté dans `tmp/conf.json` (mode, niveau de log, alarmes...). `Core.run(...)` : état d'exécution (volume, mood, timer, stats...). `Core.const(...)` : constantes non modifiables. Ce sont tous des `AccessorObject` qui acceptent des clés pointées (`Core.run('stats.fluxCount')`).
- Les constantes de chemins (`Core._MODULES`, `Core._MP3`, `Core._TMP`, `Core._CONF` = `bots/<nom>/`...) viennent de la section `paths` de `data/framebotDefault.json`.
- `Core.isAwake()` vaut false en mode `sleep`. Modes : `ready`, `sleep`, `test`.

### Modules et descripteur
La clé `modules` de `bots/<nom>/descriptor.json` liste les fichiers `src/modules/interfaces/*.js` et `src/modules/services/*.js` à charger. Les modules `base` sont toujours chargés ; les modules `full` seulement quand le bot est éveillé. **Un nouveau module doit être ajouté au(x) descripteur(s)**, sinon il n'est jamais chargé et son sujet de flux n'existe pas. Les interfaces encapsulent le matériel et les entrées/sorties (tts, sound, led, server, rfxcom...) ; les services implémentent les comportements (alarm, timer, mood, presence...).

### Flux (bus de messages)
Les modules ne s'appellent jamais directement ; ils communiquent via `Flux` (des Subjects RxJS, un par module, créés dans `src/api/Observers.js`).
- Format d'identifiant `type|sujet|id`, ex. `Flux.do('interface|tts|speak', { lg: 'en', msg: '...' })`. `type` vaut `interface` ou `service`, `sujet` est le nom de fichier du module.
- Conf optionnelle : `{ delay: secondes, loop: n, log: 'info'|'debug'|'trace' }`. `Flux.do` accepte aussi un objet flux `{id, data, conf}` ou un tableau de flux.
- Un module s'abonne à son sujet avec `Observers.attachFluxParseOptions('service', '<nom>', [{ id, fn, condition? }])` (`condition: { isAwake: bool }` conditionne au mode) ou avec `Observers.attachFluxParser` pour un traitement personnalisé. Un id non géré déclenche `Core.error`.
- Un module peut exporter `cron: { base: [...], full: [...] }` avec des entrées `{ cron: '<cron à 6 champs>', flux: {...} }` ; `ModuleLoader.setupCron` les enregistre.
- L'UI web et l'API déclenchent des flux via `POST /flux/:type/:subject/:id` (`src/modules/interfaces/server/api.js`). Les flux déclarés dans `descriptor.json` (ex. `knownHosts[].flux`) et dans la conf ont la même forme.

Les modules importent le framework via `require('./../../api')` → `{ Core, CoreError, CronJobList, Files, Flux, Logger, Observers, Scheduler, Utils }` ; chaque fichier crée `const log = new Logger(__filename)`.

### Fichiers de configuration d'un bot (`bots/<nom>/`)
`descriptor.json` (modules, surcharges de conf, appareils rfxcom, hôtes connus...), `gpio.json` (broches → `Core.gpio`), `ttsMessages.json` (→ `Core.ttsMessages`), `logo.txt`. Les valeurs de `conf` du descripteur remplacent les entrées de la conf par défaut dont la valeur est `"."`.

### UI web
`src/web/` est une application statique AngularJS + Angular Material (bibliothèques embarquées dans `js/lib/`, pas d'étape de build) servie par l'interface `server`, avec un affichage des logs en direct par websocket.
