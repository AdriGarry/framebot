#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'beforeRestart', fn: beforeRestart },
  { id: 'goToSleep', fn: goToSleep },
  { id: 'certbot', fn: renewCertbot }
];

Observers.attachFluxParseOptions('service', 'task', FLUX_PARSE_OPTIONS);

const GO_TO_SLEEP_DELAY = 5 * 60;

function goToSleep() {
  log.info(`goToSleep in ${GO_TO_SLEEP_DELAY / 60} min`);

  // light
  new Flux('service|light|on', GO_TO_SLEEP_DELAY);

  // radiator off
  new Flux('interface|rfxcom|send', { device: 'radiator', value: true });

  // plug off
  new Flux('interface|rfxcom|send', { device: 'plugA', value: false }, { delay: 180 });

  if (Core.isAwake()) {
    new Flux('service|context|sleep', null, { delay: GO_TO_SLEEP_DELAY });
  }
}

function beforeRestart() {
  log.info('beforeRestart');
}

function renewCertbot() {
  log.INFO('renew Certbot certificate');
  // TODO use https://www.npmjs.com/package/greenlock
  Utils.execCmd('sudo framebot certbot') // TODO sudo useless ?
    .then(data => {
      log.info('Certbot certificate successfully renewed', data);
    })
    .catch(err => {
      Core.error('Error renewing Certbot certificate', err);
    });
}
