#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '0 */10 * * * *', flux: { id: 'service|presence|check' } }]
  }
};

const FLUX_PARSE_OPTIONS = [{ id: 'check', fn: checkPresence }];

Observers.attachFluxParseOptions('service', 'presence', FLUX_PARSE_OPTIONS);

const LAST_MOTION_DETECT_TIMEOUT_IN_SEC = 10 * 60;

function checkPresence() {
  log.info('Checking presence...');
  let anyKnowHostAtHome = checkNmap();
  let wasThereAnyMovementInTheLast10Minutes = checkLastMotionDetect();
  log.test('anyKnowHostAtHome', anyKnowHostAtHome);
  log.test('wasThereAnyMovementInTheLast10Minutes', wasThereAnyMovementInTheLast10Minutes);
}

function checkNmap() {
  log.info('checkNmap...');
  return false;
}

function checkLastMotionDetect() {
  log.info('checkLastMotionDetect...');
  let lastMotionDetectInSec = Utils.getDifferenceInSec(Core.conf('lastMotionDetect'));
  return lastMotionDetectInSec > 0 && lastMotionDetectInSec <= LAST_MOTION_DETECT_TIMEOUT_IN_SEC;
}
