#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	CronJobList = require(Core._CORE + 'CronJobList.js');

module.exports = {};

Core.flux.service.radiator.subscribe({
	next: flux => {
		if (flux.id == 'toggle') {
			toggleRadiator(flux.value);
		} else if (flux.id == 'timeout') {
			setRadiatorTimeout(flux.value);
		} else Core.error('unmapped flux in Radiator service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	Utils.delay(10).then(setupRadiatorMode);
});

const RADIATOR_JOB = {
	OFF: new CronJob('30 0 * * * *', function() {
		radiatorOrder('off');
	}),
	ON: new CronJob('35 0 * * * *', function() {
		radiatorOrder('on');
	}),
	AUTO: new CronJobList(Core.descriptor.rfxcom.radiator.cron)
};

function setupRadiatorMode() {
	let radiatorMode = Core.conf('radiator');
	log.info(
		'setupRadiatorMode',
		radiatorMode,
		!isNaN(radiatorMode) ? '[timeout]' : '',
		'[' + Utils.executionTime(Core.startTime) + 'ms]'
	);

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
		Core.error('Unrecognized radiator:', radiatorMode);
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
	Core.do('interface|rfxcom|send', { device: 'radiator', value: mode == 'on' ? false : true });
}

function toggleRadiator(mode) {
	log.info('toggleRadiator', mode);
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
	Core.conf('radiator', 'auto');
	clearTimeout(radiatorTimeout);
	RADIATOR_JOB.AUTO.start();
	RADIATOR_JOB.OFF.start();

	radiatorOrder(radiatorTimeoutMode == 'on' ? 'off' : 'on'); // invert mode
	log.info('radiator timeout, back to off before auto mode...');
}
