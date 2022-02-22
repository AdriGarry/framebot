#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'detect', fn: motionDetect },
  { id: 'end', fn: motionDetectEnd }
];

Observers.attachFluxParseOptions('service', 'motionDetect', FLUX_PARSE_OPTIONS);

const MOTION_DETECT_MINIMUM_SEC_TIMEOUT = { 0: Number.MAX_SAFE_INTEGER, 1: 300, 2: 120, 3: 60, 4: 30, 5: 10 };
let lastDetection = null;

function motionDetect() {
  let lastDetectionInSec = getLastDetectionInSec();
  log.info('Motion detected', '[last motion detected', Utils.formatDuration(lastDetectionInSec) + ' ago]');

  if (Core.run('mood') > 0) {
    new Flux('interface|hardware|motionDetectLight', null, { log: 'TRACE' });

    if (shouldReact()) {
      if (Core.isAwake()) {
        detectAwake(lastDetectionInSec);
      } else {
        detectSleep(lastDetectionInSec);
      }
    }
  }
  lastDetection = new Date();
}

function motionDetectEnd() {
  if (!lastDetection) lastDetection = new Date();
  let motionDuration = Math.round((new Date() - lastDetection.getTime()) / 1000);
  log.info('Motion end', '[duration:', Utils.formatDuration(motionDuration) + ']');

  if (Core.run('mood') > 0) {
    new Flux('interface|hardware|blinkLightOff', null, { log: 'TRACE' });

    if (shouldReact()) {
      if (Core.isAwake()) {
        detectEndAwake(motionDuration);
      } else {
        detectEndSleep(motionDuration);
      }
    }
  }
}

function shouldReact() {
  let moodLevel = Core.run('mood');
  if (moodLevel === 0) return;
  return getLastDetectionInSec() > MOTION_DETECT_MINIMUM_SEC_TIMEOUT[moodLevel];
}

function getLastDetectionInSec() {
  if (!lastDetection) {
    return MOTION_DETECT_MINIMUM_SEC_TIMEOUT[Core.run('mood')] + 1;
  }
  return Math.round((new Date().getTime() - lastDetection.getTime()) / 1000);
}

function detectAwake(lastDetectionInSec) {
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

function detectEndAwake(motionDuration) {
  let moodLevel = Core.run('mood');

  if (moodLevel >= 2) {
    // if (motionDuration) new Flux('interface|tts|speak', motionDuration.toString(), { log: 'TRACE' });
  }
}

function detectSleep(lastDetectionInSec) {
  log.test('detectSleep. lastDetectionInSec:', lastDetectionInSec);
  new Flux('interface|hardware|lightOn', null, { delay: 2, log: 'TRACE' });
}

function detectEndSleep(motionDuration) {}
