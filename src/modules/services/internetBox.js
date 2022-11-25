#!/usr/bin/env node

'use strict';

const { Core, CronJobList, Flux, Logger, Observers, Scheduler } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

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
    { cron: '0 59 * * * *', flux: BOX_FLUX.ON },
    { cron: '0 10 * * * *', flux: BOX_FLUX.OFF }
  ],
  BOX_OFF_STRATEGY_CRON_LIST = new CronJobList(BOX_OFF_STRATEGY_CRON, 'internetBoxOffStrategy', true);

setImmediate(() => {
  Scheduler.delay(10).then(setupBoxMode);
});

function setupBoxMode() {
  if (Core.isAwake()) boxManualOn();
}

function boxManualOn() {
  BOX_OFF_STRATEGY_CRON_LIST.stop();
  Flux.do(BOX_FLUX.ON);
  Core.run('internetBox', true);
  log.info('Internet box switched ON (access strategy stopped)');
}

function boxOffStrategy() {
  // TODO problem: parse receive from rfxcom instead of flux filter
  Flux.do(BOX_FLUX.OFF);
  BOX_OFF_STRATEGY_CRON_LIST.start();
  Core.run('internetBox', false);
  log.info('Internet box switched OFF, access strategy has been started (connexion will be available 10 first minutes of each hour)');
}
