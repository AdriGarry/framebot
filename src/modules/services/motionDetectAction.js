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

function motionDetectTimeout() {
  log.info('Motion detect timeout');

  if (Core.isAwake()) {
  } else {
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

  function moodLevel4() {}
  function moodLevel5() {}
}

function motionDetectSleep() {
  new Flux('interface|hardware|light', 10);
}
