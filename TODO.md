# Points restants

Liste des modifications proposées sur le projet et pas encore traitées.

## Bugs probables repérés en lisant le code


## Tests et qualité

- [ ] **1. Tester `Logger.js` (44 % de couverture) et des services sans matériel**, comme `time`, `timer` et `mood`. Ces services lisent `Core` et s'abonnent à leur sujet de flux au chargement : dans les tests, il faut remplacer `Core` (voir `src/test/unit/resources/coreStub.js`), créer les sujets avec `Observers.init`, puis recharger le service avec `delete require.cache[...]`. Remplacer aussi `Scheduler`, `setInterval` et la date pour éviter les vrais délais. Pas testés non plus : `Core.js` et `ModuleLoader.js`.
- [ ] **2. Lancer la couverture dans la CI** avec un seuil minimal, par exemple `c8 --check-coverage --lines <seuil>`, pour éviter qu'elle régresse. Fixer le seuil un peu en dessous de la couverture actuelle (`npm run coverage`).

## Dépôt et outillage

- [ ] **3. Reconstruire l'environnement local** :
  - `sudo rm -rf coverage` : `coverage/tmp` appartient à `root`, ce qui fait échouer `npm run coverage` ;
  - `npm run clean` puis `npm i`, parce que les liens de `node_modules/.bin` étaient cassés.

## UI

Demander à Claude de faire une migration de l'UI vers React ?
