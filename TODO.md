# Points restants

Liste des modifications proposées sur le projet et pas encore traitées.

## Bugs probables repérés en lisant le code

- [ ] **1. `Files.getDuration`** (`src/api/Files.js`, bloc `catch`) : utilise `error` au lieu de `err`. Cette variable n'existe pas, donc le `catch` plante lui-même.
- [ ] **2. `Files.getLastModifiedDate`** : appelle `Core.error`, mais `Core` n'est pas importé dans ce fichier.
- [ ] **3. `Flux` avec un délai** : un flux retardé n'incrémente pas `stats.fluxCount`. À confirmer, peut-être voulu.
- [ ] **4. `AccessorObject`** : les clés pointées ne gèrent qu'un seul niveau (`a.b`, pas `a.b.c`). Une clé pointée inconnue lève une exception au lieu de renvoyer `false`.

## Tests et qualité

- [ ] **5. Tester `Logger.js` (44 % de couverture) et des services sans matériel**, comme `time`, `timer` et `mood`. Ces services lisent `Core` et s'abonnent à leur sujet de flux au chargement : dans les tests, il faut remplacer `Core` (voir `src/test/unit/resources/coreStub.js`), créer les sujets avec `Observers.init`, puis recharger le service avec `delete require.cache[...]`. Remplacer aussi `Scheduler`, `setInterval` et la date pour éviter les vrais délais. Pas testés non plus : `Core.js` et `ModuleLoader.js`.
- [ ] **6. Lancer la couverture dans la CI** avec un seuil minimal, par exemple `c8 --check-coverage --lines <seuil>`, pour éviter qu'elle régresse. Fixer le seuil un peu en dessous de la couverture actuelle (`npm run coverage`).

## Dépôt et outillage

- [ ] **7. Nettoyer les branches distantes** (`WIP`, `dependabot/*`, branches déjà fusionnées).
- [ ] **8. Reconstruire l'environnement local** :
  - `sudo rm -rf coverage` : `coverage/tmp` appartient à `root`, ce qui fait échouer `npm run coverage` ;
  - `npm run clean` puis `npm i`, parce que les liens de `node_modules/.bin` étaient cassés.

## UI

Demander à Claude de faire une migration de l'UI vers React ?
