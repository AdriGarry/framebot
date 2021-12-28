#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [{ id: 'start', fn: startHomeOffice }];

Observers.attachFluxParseOptions('service', 'homeOffice', FLUX_PARSE_OPTIONS);

function startHomeOffice() {
  log.info('startHomeoffice');
  setupHomeOffice();
}

function setupHomeOffice() {
  log.info('setupHomeOffice');

  // Mood
  new Flux('service|mood|set', 4);

  // Clockwork
  new Flux('service|time|now', null, { delay: 10 * 60, loop: 30 });
}
