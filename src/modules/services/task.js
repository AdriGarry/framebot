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

  new Flux('service|mood|set', 0);

  // radiator off
  new Flux('interface|rfxcom|send', { device: 'radiator', value: true });

  // plug off
  new Flux('interface|rfxcom|send', { device: 'plug1', value: false }, { delay: 3 * 60 });
  new Flux('interface|rfxcom|send', { device: 'plug2', value: false }, { delay: 3 * 60 });
  new Flux('interface|rfxcom|send', { device: 'plug3', value: false }, { delay: 3 * 60 });
  new Flux('interface|rfxcom|send', { device: 'plug11', value: false }, { delay: 3 * 60 });
  new Flux('interface|rfxcom|send', { device: 'plug12', value: false }, { delay: 3 * 60 });
  new Flux('interface|rfxcom|send', { device: 'plug13', value: false }, { delay: 3 * 60 });
  new Flux('interface|rfxcom|send', { device: 'plug14', value: false }, { delay: 3 * 60 });

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
  Utils.execCmd('/usr/bin/sudo /usr/bin/framebot certbot') // TODO sudo useless ?
    .then(data => {
      log.info('Certbot certificate successfully renewed', data);
    })
    .catch(err => {
      Core.error('Error renewing Certbot certificate', err);
    });
}
