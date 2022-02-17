#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'detect', fn: motionDetect },
  { id: 'timeout', fn: motionDetectTimeout }
];

Observers.attachFluxParseOptions('service', 'motionDetectAction', FLUX_PARSE_OPTIONS);

let LAST = { DETECTION: null, TIMEOUT: null };

function motionDetect() {
  if (!LAST.DETECTION) {
    LAST.DETECTION = new Date();
  }
  let lastDetectionInSec = Math.round((new Date().getTime() - LAST.DETECTION.getTime()) / 1000);
  log.info('Motion detected', '[last motion detected', lastDetectionInSec + 's ago]');
  LAST.DETECTION = new Date();
  LAST.TIMEOUT = null;

  if (Core.isAwake()) {
    detectAwake(lastDetectionInSec);
  } else {
    detectSleep(lastDetectionInSec);
  }
}

function motionDetectTimeout() {
  LAST.TIMEOUT = new Date();
  if (!LAST.DETECTION) LAST.DETECTION = new Date();
  let motionDuration = Math.round((LAST.TIMEOUT.getTime() - LAST.DETECTION.getTime()) / 1000);
  log.info('Motion timeout', '[duration:', motionDuration + 's]');

  if (Core.isAwake()) {
    detectTimeoutAwake(motionDuration);
  } else {
    detectTimeoutSleep(motionDuration);
  }
}

function detectAwake(lastDetectionInSec) {
  new Flux('interface|hardware|blinkLightOff');

  let moodLevel = Core.run('mood');
  if (moodLevel >= 2) moodLevel2();
  if (moodLevel >= 3) moodLevel3();
  if (moodLevel >= 4) moodLevel4();
  if (moodLevel >= 5) moodLevel5();

  function moodLevel2() {
    let shouldReact = lastDetectionInSec > 60 ? true : false;
    if (shouldReact) {
      new Flux('interface|sound|motionDetect');
    }
  }
  function moodLevel3() {
    let shouldReact = lastDetectionInSec > 90 ? true : false;
    if (shouldReact) {
      new Flux('service|interaction|random');
    }
  }
  function moodLevel4() {
    new Flux('service|interaction|random', null, { delay: 10 });
  }
  function moodLevel5() {}
}

function detectTimeoutAwake(motionDuration) {
  new Flux('interface|hardware|blinkLightOff', null, { delay: 1 });

  let moodLevel = Core.run('mood');
  if (moodLevel >= 2) moodLevel2(motionDuration);

  function moodLevel2(motionDuration) {
    if (motionDuration) new Flux('interface|tts|speak', motionDuration.toString());
  }
}

function detectSleep(lastDetectionInSec) {
  let shouldReact = lastDetectionInSec > 60 ? true : false;
  log.test('detectSleep. lastDetectionInSec:', lastDetectionInSec);
  if (shouldReact) {
    new Flux('interface|hardware|lightOn');
  }
}

function detectTimeoutSleep(motionDuration) {
  new Flux('interface|hardware|blinkLightOff', null, { delay: 1 });
}
