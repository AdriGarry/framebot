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

const CHECK_PRESENCE_INTERVAL_MIN = 10;

setImmediate(() => {
  Scheduler.delay(15).then(() => {
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
  let anyKnowHostAtHome = isAnyKnowHostAtHome();
  let wasThereAnyMovementInTheLast10Minutes = isAnyMovementInLastPeriod();
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

function isAnyKnowHostAtHome() {
  let presenceHosts = Core.run('presenceHosts');
  return presenceHosts && presenceHosts.length;
}

function isAnyMovementInLastPeriod() {
  log.test('motionDetect:', Core.conf('motionDetect'));
  let isStillSomeMovements = Core.conf('motionDetect.last').getTime() < Core.conf('motionDetect.end').getTime();
  log.test('isStillSomeMovements', isStillSomeMovements);

  let lastMotionDetectInSec = Utils.getDifferenceInSec(Core.conf('motionDetect.last'));
  log.test('lastMotionDetectInSec > CHECK_PRESENCE_INTERVAL_SEC:', lastMotionDetectInSec > CHECK_PRESENCE_INTERVAL_MIN, lastMotionDetectInSec);
  return isStillSomeMovements || lastMotionDetectInSec > CHECK_PRESENCE_INTERVAL_MIN * 60;
}

function newEvent(event) {
  log.info('Presence event:', event);
  Core.run('presence', true);
  checkPresenceScheduler();
  someoneAtHome();
}

function someoneAtHome() {
  Flux.do('service|internetBox|on');
}

function nooneAtHome() {
  Flux.do('service|internetBox|off');
}
