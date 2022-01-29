#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [{ cron: '* 25 8 1,2 * *', flux: { id: 'service|homeOffice|start' } }]
  }
};

const FLUX_PARSE_OPTIONS = [{ id: 'start', fn: startHomeOffice }];

Observers.attachFluxParseOptions('service', 'homeOffice', FLUX_PARSE_OPTIONS);

function startHomeOffice() {
  log.info('startHomeoffice');
  // TODO Test isAwake ...
  setupHomeOffice();
  Scheduler.decrement('resetHomOffice', 6, resetHomOffice, 60 * 60);
}

function resetHomOffice() {
  log.info('Reset home office functions... TODO !');
}

function setupHomeOffice() {
  log.info('setupHomeOffice');

  // Desktop plug ON ~after 10 sec
  new Flux('service|powerPlug|toggle', { plug: 'plugA', mode: true }, { delay: 10 });

  // Mood
  new Flux('service|mood|set', 4);

  // Mood to 0 at 12:30 + TTS ?
  // new Flux('service|mood|set', 4);
  // Mood to 0 at 1:45 + TTS ?
  // new Flux('service|mood|set', 4);

  // Clockwork ~each 13min
  new Flux('service|time|now', null, { delay: 13 * 60, loop: 30 });

  // Russia ~each 50min
  new Flux('service|interaction|russia', null, { delay: 50 * 60, loop: 10 });

  // Desktop plug OFF at 5:30pm
  // new Flux('service|powerPlug|toggle', { plug: 'plugA', mode: false });
}
