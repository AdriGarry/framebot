#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [{ id: 'bonneNuit', fn: bonneNuit }];

Observers.attachFluxParseOptions('service', 'childs', FLUX_PARSE_OPTIONS);

function bonneNuit() {
  new Flux([
    { id: 'interface|tts|speak', data: { msg: 'Bonne nuit mes Lou lou te' } },
    { id: 'interface|tts|speak', data: { voice: 'google', msg: 'Et, faites de beaux raives !' } }
  ]);
}

function playlistChilds() {
  new Flux({ id: 'interface|sound|play', data: { mp3: 'childs/playlist.mp3' } });
}
