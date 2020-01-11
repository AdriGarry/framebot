#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	// cron: {
	// 	// 	base: [{ cron: '30 0 * * * *', flux: { id: 'service|scheduler|scheduleSend' } }]
	// }
};

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

const RADIATOR_CRON = Core.descriptor.radiator.cron;

function setupRadiatorMode() {
	let radiatorMode = Core.conf('radiator');
	log.info('setupRadiatorMode', radiatorMode, !isNaN(radiatorMode) ? '[timeout]' : ''); // debug ?
	if (radiatorMode == 'auto') {
		setupRadiatorCron();
	} else if (!isNaN(radiatorMode)) {
		setRadiatorTimeout(radiatorMode);
	} else if (radiatorMode == 'on') {
		Core.do('interface|rfxcom|set', { device: 'radiator', value: false });
	} else {
		Core.do('interface|rfxcom|set', { device: 'radiator', value: true });
	}
}

function setupRadiatorCron() {
	Core.do('controller|cron|start', RADIATOR_CRON, { log: 'debug' });
}

function toggleRadiator(mode) {
	log.info('toggleRadiator', mode);
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', mode);
	Core.do('interface|rfxcom|set', { device: 'radiator', value: mode == 'on' ? false : true });
}

let radiatorTimeout;

function setRadiatorTimeout(hoursToTimeout) {
	log.info('setRadiatorTimeout', hoursToTimeout);
	Core.conf('radiator', hoursToTimeout);
	Core.do('interface|rfxcom|set', { device: 'radiator', value: false });
	if (!Core.conf('radiator')) {
		Core.do('interface|rfxcom|set', { device: 'radiator', value: true });
		Core.conf('radiator', 'auto');
		log.info('radiator timeout, back to off or auto');
		clearTimeout(radiatorTimeout);
		return;
	}
	hoursToTimeout = --hoursToTimeout;
	radiatorTimeout = setTimeout(() => {
		setRadiatorTimeout(hoursToTimeout);
	}, 10 * 1000);
}
