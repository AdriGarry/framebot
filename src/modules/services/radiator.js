#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const Core = require('./../../core/Core').Core;

const { CronJobList, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'toggle', fn: radiatorOrder },
	{ id: 'manual', fn: toggleManualRadiator },
	{ id: 'timeout', fn: setRadiatorTimeout }
];

Observers.attachFluxParseOptions('service', 'radiator', FLUX_PARSE_OPTIONS);

setImmediate(() => {
	Utils.delay(10).then(setupRadiatorMode);
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
	log.info('radiatorOrder', mode);
	new Flux('interface|rfxcom|send', { device: 'radiator', value: mode == 'on' ? false : true });
}

function toggleManualRadiator(mode) {
	log.info('toggleManualRadiator', mode);
	RADIATOR_JOB.AUTO.stop();
	RADIATOR_JOB.ON.stop();
	RADIATOR_JOB.OFF.stop();
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', mode);
	if (mode == 'on') {
		RADIATOR_JOB.ON.start();
		radiatorOrder('on');
	} else {
		RADIATOR_JOB.OFF.start();
		radiatorOrder('off');
	}
}

let radiatorTimeout;

function setRadiatorTimeout(arg) {
	log.info('setRadiatorTimeout', arg);
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', arg);
	RADIATOR_JOB.AUTO.stop();
	RADIATOR_JOB.ON.stop();
	RADIATOR_JOB.OFF.stop();
	radiatorOrder(arg.mode);
	decrementRadiatorTimeout();
}

function decrementRadiatorTimeout() {
	let arg = Core.conf('radiator');
	log.info('decrementRadiatorTimeout', arg);
	if (!arg.timeout) {
		endRadiatorTimeout();
		return;
	}
	radiatorTimeout = setTimeout(() => {
		arg.timeout = --arg.timeout;
		Core.conf('radiator', arg);
		decrementRadiatorTimeout();
	}, 60 * 1000);
}

function endRadiatorTimeout() {
	let radiatorTimeoutMode = Core.conf('radiator').mode;
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', 'auto');
	RADIATOR_JOB.AUTO.start();
	RADIATOR_JOB.OFF.start();

	let newRadiatorTimeoutMode = radiatorTimeoutMode == 'on' ? 'off' : 'on'; // invert mode
	radiatorOrder(newRadiatorTimeoutMode);
	log.info('radiator timeout, back to' + newRadiatorTimeoutMode + 'before auto mode...');
}

function isRadiatorSeason() {
	let currentMonth = new Date().getMonth();
	if (RADIATOR_MONTHS.includes(currentMonth)) return true;
	return false;
}