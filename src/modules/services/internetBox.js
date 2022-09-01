#!/usr/bin/env node

'use strict';

const { Core, CronJobList, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '20 5 * * * *', flux: { id: 'service|network|netstat' } }]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'strategy', fn: internetBoxStrategy },
  { id: 'strategyOff', fn: internetBoxStrategyOff }
];

Observers.attachFluxParseOptions('service', 'network', FLUX_PARSE_OPTIONS);

const INTERNET_BOX_STRATEGY_CRON = [
    { cron: '0 55 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plug2', value: true } } },
    { cron: '0 10 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plug2', value: false } } }
  ],
  internetBoxStrategyCrons = new CronJobList(INTERNET_BOX_STRATEGY_CRON, 'internetBoxOffStrategy', true);

setImmediate(() => {
  // TODO useless ?
});

/** Function to get connected from 0 to 10 min of each hour */
function internetBoxStrategy() {
  log.info('Starting internet box strategy...');
  internetBoxStrategyCrons.start();
}

function internetBoxStrategyOff() {
  // TODO problem: parse receive from rfxcom instead of flux filter
  // TODO test internetBoxStrategyCrons.nextDate value in more than 15 min ?
  log.info('internetBoxStrategyOff', internetBoxStrategyCrons.nextDate());
  return;
  log.info('Stopping internet box strategy');
  internetBoxStrategyCrons.stop();
}
