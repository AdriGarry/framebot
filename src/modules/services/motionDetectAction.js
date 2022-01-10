#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'detect', fn: motionDetect },
  { id: 'timeout', fn: motionDetectTimeout }
];

Observers.attachFluxParseOptions('service', 'motionDetectAction', FLUX_PARSE_OPTIONS);

function motionDetect() {
  log.info('Motion detected');

  if (Core.isAwake()) {
    motionDetectAwake();
  } else {
    motionDetectSleep();
  }
}

function motionDetectAwake() {
  new Flux('interface|sound|play', { mp3: 'system/sonar.mp3' });
}

function motionDetectSleep() {
  // Scheduler.debounce(new Flux('interface|hardware|light', 10), 60, true);
  new Flux('interface|hardware|light', 3);
}

function motionDetectTimeout() {
  log.info('Motion detect timeout');

  //new Flux('interface|led|altLeds', { speed: 30, duration: 1.5 }); //, { log: 'trace' }
}
