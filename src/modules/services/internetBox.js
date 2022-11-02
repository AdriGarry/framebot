#!/usr/bin/env node

'use strict';

const { Core, CronJobList, Flux, Logger, Observers, Scheduler } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    // base: [{ cron: '50 */20 0-5 * * *', flux: { id: 'service|internetBox|offStrategyIfNoActivity' } }]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'on', fn: boxManualOn },
  { id: 'off', fn: boxOffStrategy }
];

Observers.attachFluxParseOptions('service', 'internetBox', FLUX_PARSE_OPTIONS);

const BOX_PLUG = 'plug2';

const BOX_FLUX = {
    ON: { id: 'interface|rfxcom|send', data: { device: BOX_PLUG, value: true } },
    OFF: { id: 'interface|rfxcom|send', data: { device: BOX_PLUG, value: false } }
  },
  BOX_OFF_STRATEGY_CRON = [
    { cron: '15 59 * * * *', flux: BOX_FLUX.ON },
    { cron: '15 10 * * * *', flux: BOX_FLUX.OFF }
  ],
  BOX_OFF_STRATEGY_CRON_LIST = new CronJobList(BOX_OFF_STRATEGY_CRON, 'internetBoxOffStrategy', true);

setImmediate(() => {
  Scheduler.delay(10).then(setupBoxMode);
});

function setupBoxMode() {
  if (shouldSetBoxManualOn()) {
    boxManualOn();
  } else {
    // boxOffStrategy();
  }
}
function shouldSetBoxManualOn() {
  return true;
  return Core.isAwake() && Core.run('internetBox');
  // TODO && (isAnyoneAtHome || lastDetect < 1h)
}

function boxManualOn() {
  log.info('Stopping internet box OFF strategy...');
  BOX_OFF_STRATEGY_CRON_LIST.stop();

  log.info('Starting internet box...');
  new Flux(BOX_FLUX.ON);
  Core.run('internetBox', true);
  new Flux('service|network|testConnection', null, { delay: 30, loop: 2 });
}

function boxOffStrategy() {
  // // TODO problem: parse receive from rfxcom instead of flux filter
  // // TODO test internetBoxStrategyCrons.nextDate value in more than 15 min ?

  log.info('Stopping internet box...');
  new Flux(BOX_FLUX.OFF);

  log.info('Starting internet box OFF strategy... Connexion will be available 10 first minutes of each hour');
  BOX_OFF_STRATEGY_CRON_LIST.start();
  Core.run('internetBox', false);
}
