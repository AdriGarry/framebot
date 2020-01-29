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
	); // debug ?

	RADIATOR_JOB.OFF.start();

	if (radiatorMode == 'auto') {
		RADIATOR_JOB.AUTO.start();
		// TODO ...
	} else if (!isNaN(radiatorMode)) {
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
	log.test('setRadiatorTimeout TODO set 60*60*1000 as timeout'); // TODO remove this line
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
	let hoursToTimeout = arg.timeout,
		mode = arg.mode;

	// if (mode == 'on') {
	// 	RADIATOR_JOB.ON.stop();
	// } else {
	// 	RADIATOR_JOB.OFF.stop();
	// }

	log.info('setRadiatorTimeout', hoursToTimeout);
	Core.conf('radiator', hoursToTimeout);
	Core.do('interface|rfxcom|send', { device: 'radiator', value: false });
	if (!Core.conf('radiator')) {
		Core.do('interface|rfxcom|send', { device: 'radiator', value: true });
		Core.conf('radiator', 'auto');
		log.info('radiator timeout, back to off or auto');
		clearTimeout(radiatorTimeout);
		return;
	}
	hoursToTimeout = --hoursToTimeout;
	radiatorTimeout = setTimeout(() => {
		log.test('TODO set 60*60*1000 as timeout'); // TODO remove this line
		setRadiatorTimeout({ timeout: hoursToTimeout, mode: mode });
	}, 10 * 1000); // TODO set 60*60*1000 as timeout
}
