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
		Core.do('interface|rfxcom|send', { device: 'radiator', value: true });
	}),
	ON: new CronJob('35 0 * * * *', function() {
		Core.do('interface|rfxcom|send', { device: 'radiator', value: true });
	}),
	AUTO: new CronJobList(Core.descriptor.radiator.cron)
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
	} else if (typeof radiatorMode === 'object') {
		setRadiatorTimeout(radiatorMode);
	} else if (radiatorMode == 'on') {
		RADIATOR_JOB.ON.start();
		Core.do('interface|rfxcom|send', { device: 'radiator', value: false });
	} else if (radiatorMode == 'off') {
		RADIATOR_JOB.OFF.start();
		Core.do('interface|rfxcom|send', { device: 'radiator', value: true });
	} else {
		Core.error('Unrecognized radiator:', radiatorMode);
	}
}

// TODO comparer les prochaines dates pour les différents cron (on & off)

function toggleRadiator(mode) {
	log.info('toggleRadiator', mode);
	RADIATOR_JOB.AUTO.stop();
	RADIATOR_JOB.ON.stop();
	RADIATOR_JOB.OFF.stop();
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', mode);
	if (mode == 'on') {
		RADIATOR_JOB.ON.start();
	} else {
		RADIATOR_JOB.OFF.start();
	}
	Core.do('interface|rfxcom|send', { device: 'radiator', value: mode == 'on' ? false : true });
}

let radiatorTimeout;

function setRadiatorTimeout(arg) {
	log.info('setRadiatorTimeout', arg);
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', arg);
	RADIATOR_JOB.AUTO.stop();
	RADIATOR_JOB.ON.stop();
	RADIATOR_JOB.OFF.stop();
	Core.do('interface|rfxcom|send', { device: 'radiator', value: arg.mode == 'on' ? false : true });
	decrementRadiatorTimeout();
}

function decrementRadiatorTimeout() {
	let arg = Core.conf('radiator');
	log.info('decrementRadiatorTimeout', arg);
	if (!arg.timeout) {
		endRadiatorTimeout();
		return;
	}
	arg.timeout = --arg.timeout;
	Core.conf('radiator', arg);
	radiatorTimeout = setTimeout(() => {
		decrementRadiatorTimeout();
	}, 60 * 1000);
}

function endRadiatorTimeout() {
	clearTimeout(radiatorTimeout);
	RADIATOR_JOB.AUTO.start();
	RADIATOR_JOB.OFF.start();
	Core.do('interface|rfxcom|send', { device: 'radiator', value: Core.conf('radiator').mode == 'on' ? true : false });
	Core.conf('radiator', 'auto');
	log.info('radiator timeout, back to off before auto mode...');
}
