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
const RADIATOR_CRON_OFF = {
	cron: '30 0 * * * *',
	flux: { id: 'interface|rfxcom|send', data: { device: 'radiator', value: true } }
};

function setupRadiatorMode() {
	let radiatorMode = Core.conf('radiator');
	log.info('setupRadiatorMode', radiatorMode, !isNaN(radiatorMode) ? '[timeout]' : ''); // debug ?
	setupRadiatorCron();
	if (!isNaN(radiatorMode)) {
		// TODO y'a un truc ici...
		setRadiatorTimeout(radiatorMode);
	} else if (radiatorMode == 'on') {
		Core.do('interface|rfxcom|send', { device: 'radiator', value: false });
	} else {
		Core.do('interface|rfxcom|send', { device: 'radiator', value: true });
	}
	log.warn('-----> setRadiatorTimeout TODO set 60*60*1000 as timeout'); // TODO remove this line
}

function setupRadiatorCron() {
	let radiatorCronToLaunch = RADIATOR_CRON_OFF;
	if (Core.conf('radiator') == 'auto') {
		radiatorCronToLaunch = [].concat(radiatorCronToLaunch, RADIATOR_CRON);
	}
	log.debug(radiatorCronToLaunch);
	Core.do('controller|cron|start', radiatorCronToLaunch, { log: 'debug' });
}

function toggleRadiator(mode) {
	log.info('toggleRadiator', mode);
	clearTimeout(radiatorTimeout);
	Core.conf('radiator', mode);
	Core.do('interface|rfxcom|send', { device: 'radiator', value: mode == 'on' ? false : true });
}

let radiatorTimeout;

function setRadiatorTimeout(hoursToTimeout) {
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
		log.warn('TODO set 60*60*1000 as timeout'); // TODO remove this line
		setRadiatorTimeout(hoursToTimeout);
	}, 10 * 1000); // TODO set 60*60*1000 as timeout
}
