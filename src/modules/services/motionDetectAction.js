#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'detect', fn: motionDetect },
  { id: 'timeout', fn: motionDetectTimeout }
];

Observers.attachFluxParseOptions('service', 'motionDetectAction', FLUX_PARSE_OPTIONS);

let LAST = { DETECTION: null, TIMEOUT: null };

function motionDetect() {
  let lastDetectionInSec = (new Date().getTime() - LAST.DETECTION.getTime()) / 1000;
  log.info('Motion detected', '[last motion detected', lastDetectionInSec + 's ago]');
  LAST.DETECTION = new Date();
  LAST.TIMEOUT = null;

  if (Core.isAwake()) {
    motionDetectAwake();
  } else {
    motionDetectSleep();
  }
}

function motionDetectTimeout() {
  LAST.TIMEOUT = new Date();
  let motionDuration = (LAST.TIMEOUT.getTime() - LAST.DETECTION.getTime()) / 1000;
  log.info('Motion timeout', '[duration:', motionDuration + 's]');

  if (Core.isAwake()) {
    motionDetectTimeoutAwake(motionDuration);
  } else {
    motionDetectTimeoutSleep();
  }
}

function motionDetectAwake() {
  let moodLevel = Core.run('mood');
  if (moodLevel >= 2) moodLevel2();
  if (moodLevel >= 3) moodLevel3();
  if (moodLevel >= 4) moodLevel4();
  if (moodLevel >= 5) moodLevel5();

  function moodLevel2() {
    new Flux('interface|sound|play', { mp3: 'system/sonar.mp3' });
  }
  function moodLevel3() {
    new Flux('service|interaction|random');
  }
  function moodLevel4() {
    new Flux('service|interaction|random', null, { delay: 10 });
  }
  function moodLevel5() {}
}

function motionDetectTimeoutAwake(motionDuration) {
  log.info('motionDetectTimeoutAwake');
  new Flux('interface|tts|speak', { msg: 'timeout', lg: 'en' });
  //new Flux('interface|tts|speak', { msg: 'timeout ' + motionDuration + ' sec', lg: 'en' });
}

function motionDetectSleep() {
  log.info('motionDetectSleep');
  new Flux('interface|hardware|light', 10);
}

function motionDetectTimeoutSleep() {
  log.info('motionDetectTimeoutSleep');
}
