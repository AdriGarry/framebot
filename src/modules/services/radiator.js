#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const { Core, CronJobList, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'toggle', fn: radiatorOrder },
  { id: 'manual', fn: toggleManualRadiator },
  { id: 'auto', fn: setRadiatorAuto },
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
    RADIATOR_JOB.AUTO.start();
    //onOrOffUntilNextOrder();
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
  let datesToCompare = [
    { mode: 'off', date: new Date(RADIATOR_JOB.OFF.nextDate()).toLocaleString() },
    { mode: 'on', date: new Date(RADIATOR_JOB.AUTO.nextDate()).toLocaleString() }
  ];
  let nextDate = Utils.getNextDateObject(datesToCompare);
  log.info('onOrOffUntilNextOrder', nextDate);
  radiatorOrder(nextDate.mode);
}

function radiatorOrder(mode) {
  if (!(mode === 'on' || mode === 'off')) {
    mode = 'off';
  }
  Core.run('radiator', mode);
  log.info('radiator order:', mode);
  new Flux('interface|rfxcom|send', { device: 'radiator', value: mode == 'on' ? false : true });
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

function setRadiatorAuto() {
  log.info('setRadiatorAuto');
  Core.conf('radiator', 'auto');
  // TODO determine radiator status from next order...
  // TODO link to/merge with endRadiatorTimeout!
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
  let radiatorTimeoutMode = Core.conf('radiator').mode;
  Core.conf('radiator', 'auto');
  RADIATOR_JOB.AUTO.start();
  RADIATOR_JOB.OFF.start();

  let newRadiatorTimeoutMode = radiatorTimeoutMode == 'on' ? 'off' : 'on'; // invert mode
  radiatorOrder(newRadiatorTimeoutMode);
  log.info('radiator timeout, back to', newRadiatorTimeoutMode, 'before auto mode...');
}

function isRadiatorSeason() {
  let currentMonth = new Date().getMonth();
  if (RADIATOR_MONTHS.includes(currentMonth)) return true;
  return false;
}
