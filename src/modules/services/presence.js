#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'check', fn: checkPresence },
  { id: 'event', fn: newEvent }
];

Observers.attachFluxParseOptions('service', 'presence', FLUX_PARSE_OPTIONS);

const LAST_MOTION_DETECT_TIMEOUT_IN_SEC = 10 * 60;
const CHECK_PRESENCE_INTERVAL_MIN = 10; // TODO set to 20min

setImmediate(() => {
  Scheduler.delay(10).then(() => {
    checkPresence();
    checkPresenceScheduler();
  });
});

let checkPresenceInterval;
function checkPresenceScheduler() {
  log.info(`Schedule check presence... [${CHECK_PRESENCE_INTERVAL_MIN}min]`);
  clearInterval(checkPresenceInterval);
  checkPresenceInterval = setInterval(() => {
    checkPresence();
  }, CHECK_PRESENCE_INTERVAL_MIN * 60 * 1000);
}

function checkPresence() {
  let anyKnowHostAtHome = checkNmap();
  let wasThereAnyMovementInTheLast10Minutes = checkLastMotionDetect();
  let isSomeoneAtHome = anyKnowHostAtHome || wasThereAnyMovementInTheLast10Minutes;
  log.info(
    `Checking presence: ${isSomeoneAtHome} [anyKnowHostAtHome=${anyKnowHostAtHome}, wasThereAnyMovementInTheLast10Minutes=${wasThereAnyMovementInTheLast10Minutes}]`
  );

  if (isSomeoneAtHome !== Core.run('presence')) {
    Core.run('presence', isSomeoneAtHome);
    if (isSomeoneAtHome) {
      someoneAtHome();
    } else {
      nooneAtHome();
    }
  }
}

function checkNmap() {
  log.info('checkNmap...');
  // TODO to implement...
  return false;
}

function checkLastMotionDetect() {
  return false; // TODO remove this mock
  log.info('checkLastMotionDetect...');
  let lastMotionDetectInSec = Utils.getDifferenceInSec(Core.conf('lastMotionDetect'));
  return lastMotionDetectInSec > 0 && lastMotionDetectInSec <= LAST_MOTION_DETECT_TIMEOUT_IN_SEC;
}

function newEvent(event) {
  log.info('newEvent', event);
  Core.run('presence', true);
  checkPresenceScheduler();
  someoneAtHome();
}

function someoneAtHome() {
  new Flux('service|internetBox|on');
}

function nooneAtHome() {
  new Flux('service|internetBox|off');
}
