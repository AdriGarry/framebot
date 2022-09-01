#!/usr/bin/env node

'use strict';

const { Core, CronJobList, Flux, Logger, Observers, Scheduler } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '50 */20 0-5 * * *', flux: { id: 'service|internetBox|strategyOffIfNoActivity' } }]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'strategyOn', fn: boxStrategyOn },
  { id: 'strategyOff', fn: boxStrategyOff },
  { id: 'strategyOffIfNoActivity', fn: strategyOffIfNoActivity }
];

Observers.attachFluxParseOptions('service', 'internetBox', FLUX_PARSE_OPTIONS);

const BOX_PLUG = 'plug2';

const BOX_FLUX = {
  ON: { id: 'interface|rfxcom|send', data: { device: BOX_PLUG, value: true } },
  OFF: { id: 'interface|rfxcom|send', data: { device: BOX_PLUG, value: false } }
};

// const BOX_STRATEGY_CRON = [
//     // TODO revoir les CRON. Crons de prod:
//     // { cron: '0 55 * * * *', flux: BOX_FLUX.ON },
//     // { cron: '0 10 * * * *', flux: BOX_FLUX.OFF }
//     { cron: '0 55 * * * *', flux: BOX_FLUX.ON },
//     { cron: '0 10 * * * *', flux: BOX_FLUX.OFF }
//   ],
//   boxStrategyCrons = new CronJobList(BOX_STRATEGY_CRON, 'internetBoxOffStrategy', true);

setImmediate(() => {
  // Scheduler.delay(10).then(() => boxStrategyOnIfAwake());
});

function boxStrategyOnIfAwake() {
  if (Core.isAwake()) {
    boxStrategyOn();
  }
}

// boxStrategyOffIfNoMotionDetectedAfterMidnight
function strategyOffIfNoActivity() {
  if (Core.run('internetBox')) {
    // TODO if after midnight & lastMotionDetect > 1h
    if (!Core.isAwake()) {
      boxStrategyOff();
    }
  }
}

function boxStrategyOn() {
  log.info('Starting internet box strategy...');
  Core.run('internetBox', true);
  new Flux(BOX_FLUX.ON);
  // boxStrategyCrons.start();
  new Flux('service|network|testConnection', null, { delay: 30, loop: 2 });
}

function boxStrategyOff() {
  // // TODO problem: parse receive from rfxcom instead of flux filter
  // // TODO test internetBoxStrategyCrons.nextDate value in more than 15 min ?
  // log.test('internetBoxStrategyOff', boxStrategyCrons.nextDate());

  // return;
  log.info('Stopping internet box strategy');
  // boxStrategyCrons.stop();
  new Flux(BOX_FLUX.OFF);
  Core.run('internetBox', false);
}
