#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const { Core, CronJobList, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'toggle', fn: radiatorOrder },
  { id: 'manual', fn: toggleManualRadiator },
  { id: 'auto', fn: setRadiatorModeToAuto },
  { id: 'timeout', fn: setRadiatorTimeout }
];

Observers.attachFluxParseOptions('service', 'radiator', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  Scheduler.delay(10).then(setupRadiatorMode);
});

const RADIATOR_MONTHS = [0, 1, 2, 3, 9, 10, 11];
const RADIATOR_JOB = {
  OFF: new CronJob('30 0 * * * *', function () {
    radiatorOrder('off');
  }),
  ON: new CronJob('35 0 * * * *', function () {
    radiatorOrder('on');
  }),
  AUTO: new CronJobList(Core.descriptor.rfxcomDevices.radiator.cron, 'radiator-auto', true)
};

function setupRadiatorMode() {
  if (!isRadiatorSeason()) {
    Core.conf('radiator', 'off');
    return;
  }
  let radiatorMode = Core.conf('radiator');
  log.info('setupRadiatorMode', radiatorMode, !isNaN(radiatorMode) ? '[timeout]' : '');

  RADIATOR_JOB.OFF.start();

  if (radiatorMode == 'auto') {
    setRadiatorModeToAuto();
  } else if (typeof radiatorMode === 'object') {
    setRadiatorTimeout(radiatorMode);
  } else if (radiatorMode == 'on') {
    RADIATOR_JOB.OFF.stop();
    RADIATOR_JOB.ON.start();
    radiatorOrder('on');
  } else if (radiatorMode == 'off') {
    radiatorOrder('off');
  } else {
    Core.error('Unrecognized radiator mode:', radiatorMode);
  }
}

function onOrOffUntilNextOrder() {
  let nextAutoOrderDateTime = new Date(RADIATOR_JOB.AUTO.nextDates());
  let secondsRemainingToNextOnOrder = Utils.getDifferenceInSec(nextAutoOrderDateTime);
  let order = secondsRemainingToNextOnOrder > 3600 ? 'off' : 'on';
  log.info('onOrOffUntilNextOrder:', order, '(' + Math.floor(secondsRemainingToNextOnOrder / 60) + 'm ' + (secondsRemainingToNextOnOrder % 60) + 's)');
  return order;
}

function setRadiatorModeToAuto() {
  log.info('setRadiatorModeToAuto');
  Core.conf('radiator', 'auto');
  RADIATOR_JOB.AUTO.start();
  radiatorOrder(onOrOffUntilNextOrder());
}

function radiatorOrder(mode) {
  if (!(mode === 'on' || mode === 'off')) {
    mode = 'off';
  }
  Core.run('radiator', mode);
  log.info('radiator order:', mode);
  Flux.do('interface|rfxcom|send', { device: 'radiator', value: mode === 'on' });
}

function toggleManualRadiator(mode) {
  log.info('toggleManualRadiator', mode);
  RADIATOR_JOB.AUTO.stop();
  RADIATOR_JOB.ON.stop();
  RADIATOR_JOB.OFF.stop();
  Scheduler.stopDecrement('radiator');
  Core.conf('radiator', mode);
  if (mode == 'on') {
    RADIATOR_JOB.ON.start();
    radiatorOrder('on');
  } else {
    RADIATOR_JOB.OFF.start();
    radiatorOrder('off');
  }
}

function setRadiatorTimeout(arg) {
  log.info('setRadiatorTimeout', arg);
  Core.conf('radiator', arg);
  RADIATOR_JOB.AUTO.stop();
  RADIATOR_JOB.ON.stop();
  RADIATOR_JOB.OFF.stop();
  radiatorOrder(arg.mode);
  Scheduler.decrement('radiator', arg.timeout, endRadiatorTimeout, 60, decrementRadiatorTimeout);
}

function decrementRadiatorTimeout() {
  let arg = Core.conf('radiator');
  arg.timeout = --arg.timeout;
  Core.conf('radiator', arg);
}

function endRadiatorTimeout() {
  log.info('radiator timeout, back to auto mode...');
  setRadiatorModeToAuto();
}

function isRadiatorSeason() {
  let currentMonth = new Date().getMonth();
  return RADIATOR_MONTHS.includes(currentMonth);
}
