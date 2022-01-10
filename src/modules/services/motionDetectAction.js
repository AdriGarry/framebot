#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'on', fn: motionDetectOn },
  { id: 'off', fn: motionDetectOff }
];

Observers.attachFluxParseOptions('service', 'motionDetectAction', FLUX_PARSE_OPTIONS);

function motionDetectOn() {
  log.info('Motion detected');

  // Scheduler.debounce(new Flux('interface|hardware|light', 10), 60, true);
  new Flux('interface|hardware|light', 3);
}

function motionDetectOff() {
  log.info('Motion detect end');
  new Flux('interface|led|altLeds', { speed: 30, duration: 1.5 }); //, { log: 'trace' }
}
