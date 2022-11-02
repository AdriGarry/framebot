#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'bonneNuit', fn: bonneNuit },
  { id: 'interact', fn: childInteract }
];

Observers.attachFluxParseOptions('service', 'childs', FLUX_PARSE_OPTIONS);

function bonneNuit() {
  Flux.do([{ id: 'interface|tts|speak', data: { voice: 'google', msg: 'Bonne nuit mes Louloutes. Et, faites de beaux raives !' } }]);
}

function childInteract(name) {
  log.info(`${name}...`);
  Flux.do('interface|tts|speak', `Coucou ma ${name} !`);
  Flux.do('interface|tts|speak', Utils.rdm() ? "C'est moi Odi..." : "C'est moi le robot...");
}
