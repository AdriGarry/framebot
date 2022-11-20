#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '30 * * * * *', flux: { id: 'service|presence|check' } }] // '30 * * * * *'
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
    // checkPresenceScheduler();
  });
});

// let checkPresenceInterval;
// function checkPresenceScheduler() {
//   log.info(`Schedule check presence... [${CHECK_PRESENCE_INTERVAL_MIN}min]`);
//   clearInterval(checkPresenceInterval);
//   checkPresenceInterval = setInterval(() => {
//     checkPresence();
//   }, CHECK_PRESENCE_INTERVAL_MIN * 60 * 1000);
// }

function checkPresence() {
  let anyKnowHostAtHome = isAnyKnowHostAtHome();
  let wasThereAnyMovementInTheLastPeriod = isAnyMovementInLastPeriod();
  let isSomeoneAtHome = anyKnowHostAtHome || wasThereAnyMovementInTheLastPeriod;
  log.info(
    `Presence check: ${isSomeoneAtHome} [anyKnowHostAtHome=${anyKnowHostAtHome}, wasThereAnyMovementInTheLastPeriod=${wasThereAnyMovementInTheLastPeriod}]`
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
  return presenceHosts && !!presenceHosts.length;
}

function isAnyMovementInLastPeriod() {
  let isStillSomeMovements = new Date(Core.conf('motionDetect.last')).getTime() > new Date(Core.conf('motionDetect.end')).getTime();
  let lastMotionDetectInSec = Utils.getDifferenceInSec(new Date(Core.conf('motionDetect.last')));
  let isLastMotionDetectTrustable = !isNaN(lastMotionDetectInSec);
  let wasThereAnyMovementInTheLastPeriod = lastMotionDetectInSec < CHECK_PRESENCE_INTERVAL_MIN * 60;
  log.test(
    `isAnyMovementInLastPeriod?\r\nisStillSomeMovements=${isStillSomeMovements}\r\nlastMotionDetectInSec=${lastMotionDetectInSec}\r\isLastMotionDetectTrustable=${isLastMotionDetectTrustable}\r\nwasThereAnyMovementInTheLastPeriod=${wasThereAnyMovementInTheLastPeriod}`
  );
  return isStillSomeMovements || !isLastMotionDetectTrustable || wasThereAnyMovementInTheLastPeriod;
}

function newEvent(event) {
  log.info('Presence event:', event);
  Core.run('presence', true);
  checkPresence();
  someoneAtHome();
}

function someoneAtHome() {
  Flux.do('service|internetBox|on');
}

function nooneAtHome() {
  log.test('.......nooneAtHome !!');
  Flux.do('service|internetBox|off');
}
