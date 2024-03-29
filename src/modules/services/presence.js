#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '40 0,30 * * * *', flux: { id: 'service|presence|check' } }] // '40 0,30 * * * *'
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'check', fn: checkPresence },
  { id: 'event', fn: newEvent }
];

Observers.attachFluxParseOptions('service', 'presence', FLUX_PARSE_OPTIONS);

const CHECK_PRESENCE_INTERVAL_MIN = 10;

setImmediate(() => {
  Scheduler.delay(13).then(() => {
    checkPresence();
  });
});

function checkPresence() {
  Flux.do('interface|nmap|scan');
  Scheduler.delay(10).then(() => {
    let anyKnownHostAtHome = isAnyKnownHostAtHome();
    let wasThereAnyMovementInTheLastPeriod = isAnyMovementInLastPeriod();
    let isSomeoneAtHome = anyKnownHostAtHome || wasThereAnyMovementInTheLastPeriod;
    log.info(
      `Presence check: ${isSomeoneAtHome} [anyKnownHostAtHome=${anyKnownHostAtHome}, wasThereAnyMovementInTheLastPeriod=${wasThereAnyMovementInTheLastPeriod}]`
    );

    if (isSomeoneAtHome !== Core.run('presence')) {
      Core.run('presence', isSomeoneAtHome);
      if (isSomeoneAtHome) {
        someoneAtHome();
      } else {
        nooneAtHome();
      }
    }
  });
}

function isAnyKnownHostAtHome() {
  let presenceHosts = Core.run('presenceHosts');
  return presenceHosts && !!presenceHosts.length;
}

function isAnyMovementInLastPeriod() {
  let isStillSomeMovements = new Date(Core.conf('motionDetect.last')).getTime() > new Date(Core.conf('motionDetect.end')).getTime();
  let lastMotionDetectInSec = Utils.getDifferenceInSec(new Date(Core.conf('motionDetect.last')));
  let isLastMotionDetectTrustable = !isNaN(lastMotionDetectInSec);
  let wasThereAnyMovementInTheLastPeriod = lastMotionDetectInSec < CHECK_PRESENCE_INTERVAL_MIN * 60;
  log.test(
    `isAnyMovementInLastPeriod?\r\nisStillSomeMovements=${isStillSomeMovements}\r\nlastMotionDetectInSec=${lastMotionDetectInSec} / ${CHECK_PRESENCE_INTERVAL_MIN}min\r\isLastMotionDetectTrustable=${isLastMotionDetectTrustable}\r\nwasThereAnyMovementInTheLastPeriod=${wasThereAnyMovementInTheLastPeriod}`
  );
  return isStillSomeMovements || !isLastMotionDetectTrustable || wasThereAnyMovementInTheLastPeriod;
}

function newEvent(event) {
  log.info('Presence event:', event);
  Core.run('presence', true);
  someoneAtHome();
}

function someoneAtHome() {
  if (!Core.run('presence')) Flux.do('service|internetBox|on');
}

function nooneAtHome() {
  log.info('No one at home...');
  log.test('Is any websocket client connected ?', Core.run('wsClients'));
  if (!Core.run('wsClients')) Flux.do('service|internetBox|off');
}
