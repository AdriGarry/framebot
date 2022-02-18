#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'detect', fn: motionDetect },
  { id: 'end', fn: motionDetectEnd }
];

Observers.attachFluxParseOptions('service', 'motionDetect', FLUX_PARSE_OPTIONS);

const MOTION_DETECT_MINIMUM_SEC_TIMEOUT = 120;
let LAST = { DETECTION: null, END: null };
let plugATimeout;

function motionDetect() {
  let lastDetectionInSec = getLastDetectionInSec();
  log.info('Motion detected', '[last motion detected', lastDetectionInSec + 's ago]');

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
  clearTimeout(plugATimeout);
  new Flux('interface|rfxcom|send', { device: 'plugA', value: true });
  LAST.DETECTION = new Date();
  LAST.END = null;
}

function motionDetectEnd() {
  LAST.END = new Date();
  if (!LAST.DETECTION) LAST.DETECTION = new Date();
  let motionDuration = Math.round((LAST.END.getTime() - LAST.DETECTION.getTime()) / 1000);
  log.info('Motion end', '[duration:', motionDuration + 's]');

  if (Core.run('mood') > 0) {
    new Flux('interface|hardware|blinkLightOff', null, { log: 'TRACE' });

    if (shouldReact()) {
      if (Core.isAwake()) {
        detectEndAwake(motionDuration);
      } else {
        detectEndSleep(motionDuration);
      }
    }
    plugATimeout = setTimeout(() => {
      new Flux('interface|rfxcom|send', { device: 'plugA', value: false });
    }, 60 * 1000);
  }
}

function shouldReact() {
  return getLastDetectionInSec() > MOTION_DETECT_MINIMUM_SEC_TIMEOUT;
}

function getLastDetectionInSec() {
  if (!LAST.DETECTION) {
    return MOTION_DETECT_MINIMUM_SEC_TIMEOUT + 1;
  }
  return Math.round((new Date().getTime() - LAST.DETECTION.getTime()) / 1000);
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
  new Flux('interface|hardware|lightOn', null, { log: 'TRACE' });
}

function detectEndSleep(motionDuration) {}
