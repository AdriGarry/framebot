#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'detect', fn: motionDetect },
  { id: 'timeout', fn: motionDetectTimeout }
];

Observers.attachFluxParseOptions('service', 'motionDetect', FLUX_PARSE_OPTIONS);

const MOTION_DETECT_MINIMUM_SEC_TIMEOUT = 120;
let LAST = { DETECTION: null, TIMEOUT: null };

function motionDetect() {
  new Flux('interface|hardware|motionDetectLight', null, { log: 'TRACE' });

  LAST.DETECTION = new Date();
  LAST.TIMEOUT = null;
  let lastDetectionInSec = getLastDetectionInSec();
  log.info('Motion detected', '[last motion detected', lastDetectionInSec + 's ago]');

  if (shouldReact()) {
    if (Core.isAwake()) {
      detectAwake(lastDetectionInSec);
    } else {
      detectSleep(lastDetectionInSec);
    }
  }
}

function motionDetectTimeout() {
  new Flux('interface|hardware|blinkLightOff', null, { delay: 1, log: 'TRACE' });

  LAST.TIMEOUT = new Date();
  if (!LAST.DETECTION) LAST.DETECTION = new Date();
  let motionDuration = Math.round((LAST.TIMEOUT.getTime() - LAST.DETECTION.getTime()) / 1000);
  log.info('Motion timeout', '[duration:', motionDuration + 's]');

  if (shouldReact()) {
    if (Core.isAwake()) {
      detectTimeoutAwake(motionDuration);
    } else {
      detectTimeoutSleep(motionDuration);
    }
  }
}

function shouldReact() {
  return getLastDetectionInSec() > MOTION_DETECT_MINIMUM_SEC_TIMEOUT;
}

function getLastDetectionInSec() {
  if (!LAST.DETECTION) {
    LAST.DETECTION = new Date();
  }
  return Math.round((new Date().getTime() - LAST.DETECTION.getTime()) / 1000);
}

function detectAwake(lastDetectionInSec) {
  new Flux('interface|hardware|blinkLightOff', null, { log: 'TRACE' });
  let moodLevel = Core.run('mood');

  if (moodLevel >= 2) {
    new Flux('interface|sound|motionDetect', null, { log: 'TRACE' });
    // new Flux('interface|tts|speak', lastDetectionInSec.toString());
  }

  if (moodLevel >= 3) {
    let shouldReact = lastDetectionInSec > 300 ? true : false;
    if (shouldReact) {
      new Flux('service|interaction|random');
    }
  }

  if (moodLevel >= 4) {
    new Flux('service|interaction|random', null, { delay: 10 });
  }
}

function detectTimeoutAwake(motionDuration) {
  let moodLevel = Core.run('mood');

  if (moodLevel >= 2) {
    // if (motionDuration) new Flux('interface|tts|speak', motionDuration.toString(), { log: 'TRACE' });
  }
}

function detectSleep(lastDetectionInSec) {
  log.test('detectSleep. lastDetectionInSec:', lastDetectionInSec);
  new Flux('interface|hardware|lightOn', null, { log: 'TRACE' });
}

function detectTimeoutSleep(motionDuration) {}
