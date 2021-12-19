#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const TEN_MINUTES = 10;

var repellentMode = false,
  repellentTimeout;

const FLUX_PARSE_OPTIONS = [
  { id: 'update', fn: updateRepellentTimeout },
  { id: 'toggle', fn: toggleMosquitoRepellentMode }
];

Observers.attachFluxParseOptions('service', 'mosquitoRepellent', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  // Scheduler.delay(10).then(initMosquitoRepellentMode);
});

const MOSQUITO_MONTHS = [4, 5, 6, 7, 8];

function initMosquitoRepellentMode() {
  if (!isMosquitoSeason()) {
    log.debug('not in mosquito season!');
    return;
  }
  log.info('Init mosquito repellent mode [' + Utils.executionTime(Core.startTime) + 'ms]');
  repellentMode = true;
  autoTogglePlugTimeout(true);
}

function updateRepellentTimeout(newTimeout) {
  Core.run('mosquitoRepellent', newTimeout);
  log.info('Mosquito repellent  timeout set to', newTimeout, 'min');
  if (repellentMode) {
    toggleMosquitoRepellentMode(); // stop
  }
  if (newTimeout) {
    toggleMosquitoRepellentMode(); // restart
  }
}

function toggleMosquitoRepellentMode() {
  if (repellentMode) {
    log.info('Stopping mosquito repellent mode');
    clearTimeout(repellentTimeout);
    plugOrder(false);
  } else {
    log.info('Starting mosquito repellent mode');
    autoTogglePlugTimeout(true);
  }
  repellentMode = !repellentMode;
}

function autoTogglePlugTimeout(mode) {
  let timeout = mode ? Core.run('mosquitoRepellent') : TEN_MINUTES - Core.run('mosquitoRepellent');
  log.info('toggle mosquito repellent plug', mode ? 'on' : 'off', 'for ' + timeout + ' min');
  plugOrder(mode);
  repellentTimeout = setTimeout(() => {
    return autoTogglePlugTimeout(!mode);
  }, timeout * 60 * 1000);
}

function plugOrder(mode) {
  if (typeof mode !== 'boolean') mode = false;
  log.debug('mosquito repellent', mode);
  new Flux('interface|rfxcom|send', { device: 'plugC', value: mode });
}

function isMosquitoSeason() {
  let currentMonth = new Date().getMonth();
  return MOSQUITO_MONTHS.includes(currentMonth);
}
