# Points restants

Liste des modifications proposées sur le projet et pas encore traitées.

## Bugs probables repérés en lisant le code


## Tests et qualité

- [ ] **1. Tester `Logger.js` (44 % de couverture) et des services sans matériel**, comme `time`, `timer` et `mood`. Ces services lisent `Core` et s'abonnent à leur sujet de flux au chargement : dans les tests, il faut remplacer `Core` (voir `src/test/unit/resources/coreStub.js`), créer les sujets avec `Observers.init`, puis recharger le service avec `delete require.cache[...]`. Remplacer aussi `Scheduler`, `setInterval` et la date pour éviter les vrais délais. Pas testés non plus : `Core.js` et `ModuleLoader.js`.

## Dépôt et outillage

- [ ] **2. Reconstruire l'environnement local** :
  - `sudo rm -rf coverage` : `coverage/tmp` appartient à `root`, ce qui fait échouer `npm run coverage` ;
  - `npm run clean` puis `npm i`, parce que les liens de `node_modules/.bin` étaient cassés.

## UI

Points relevés en analysant `src/web` :

- [ ] **3. Corriger la faille XSS des logs** : `formatLog` produit du HTML à partir de lignes de log, puis `toHtml` (`trustAsHtml`) l'injecte tel quel. Les logs contiennent des messages venant de l'extérieur (TTS, voicemail, requêtes inconnues) : échapper la ligne avant d'y ajouter les liens IP et géolocalisation. Vérifier aussi le filtre `markdown` (source `/about`, plus fiable).
- [ ] **4. Remplacer les URL en dur** `https://odi.adrigarry.com` et `wss://odi.adrigarry.com/` par `location.origin` / `location.host`. Elles sont dans `CONSTANTS`, mais aussi dans `components.js`, `services.js` (`/audio`) et `controllers.js` (`/errors`) : l'UI ne marche aujourd'hui que sur ce domaine et ignore le bot courant (`tok`).
- [ ] **5. Corriger `sendCommand`** (`services.js`) : `value !== 'object'` compare à une chaîne, il faut `typeof value`. Le `callback` est appelé sans vérification, donc `toggleDebugMode` (qui n'en passe pas) lève une exception.
- [ ] **6. Corriger le retry de géolocalisation** (`services.js`) : `getCurrentPosition(maPosition)` référence une fonction inexistante (`ReferenceError`), et un refus bloque l'écran d'accueil.
- [ ] **7. Supprimer ou corriger les appels `/time` et `/test`** : ces routes n'existent pas dans `server/api.js` (404 et toast d'erreur).
- [ ] **8. Corriger la reconnexion du websocket de logs** (`controllers.js`) : `onclose` relance une connexion après 10 s même après `closeLogTailWebSocket` (impossible d'arrêter le tail), et chaque `requireGrantAccess` réussi rouvre une socket sans fermer la précédente.
- [ ] **9. Borner `log.data`** : le tail le fait grossir sans limite (fuite mémoire).
- [ ] **10. Encoder les paramètres de `sendTTS`** avec `encodeURIComponent` : `msg` casse l'URL sur `&`, `#` ou `?`.
- [ ] **11. Fiabiliser le rafraîchissement du dashboard** : le polling est déclenché par le scroll et un `$timeout` récursif, et le seuil `failedRefreshs >= 2` est annulé par un `connexionLost = true` inconditionnel.
- [ ] **12. Revoir l'authentification** : le mot de passe est envoyé dans l'en-tête `pwd` et le paramètre de grant est lu dans l'URL (`?param`), donc conservé dans l'historique et les logs. Supprimer aussi l'en-tête client `Access-Control-Allow-Origin` (inutile, c'est un en-tête de réponse). Voir aussi la position GPS envoyée à chaque requête et Google Analytics chargé en dur dans `index.html`.
- [ ] **13. Nettoyer le code mort** : `Tile.js` et `models.js` en partie inutilisés, commentaire `pr.longpress`, `IP_REGEX_2` jamais utilisée (et invalide : tirets typographiques `–`, `b`/`d` à la place de `\b`/`\d`).
- [ ] **14. Rendre l'UI indépendante du bot** : titre, logo et textes « Odi » sont en dur alors que le framework est multi-bots.
- [ ] **15. Découper `components.js`** (1173 lignes, 25 composants) en un fichier par composant.
- [ ] **16. Traiter la fin de vie d'AngularJS** (plus de correctifs de sécurité depuis 2022) et tracer les versions des libs embarquées dans `js/lib/`. À rapprocher de la migration ci-dessous.
- [ ] **17. Mettre à jour `CLAUDE.md`** : mentionner que l'UI est liée au domaine `odi.adrigarry.com` (tant que le point 4 n'est pas fait).

Demander à Claude de faire une migration de l'UI vers React ?
