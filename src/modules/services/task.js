#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename),
	{ Utils } = require(Core._API + 'api.js');

Core.flux.service.task.subscribe({
	next: flux => {
		if (flux.id == 'beforeRestart') {
			beforeRestart();
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else if (flux.id == 'internetBoxStrategy') {
			internetBoxStrategy();
		} else if (flux.id == 'internetBoxStrategyOff') {
			internetBoxStrategyOff();
		} else if (flux.id == 'certbot') {
			renewCertbot();
		} else Core.error('unmapped flux in Task service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

const GO_TO_SLEEP_DELAY = 5 * 60;

function goToSleep() {
	log.info(`goToSleep in ${GO_TO_SLEEP_DELAY / 60} min`);

	// light
	Core.do('interface|hardware|light', GO_TO_SLEEP_DELAY);

	// radiator off
	Core.do('interface|rfxcom|send', { device: 'radiator', value: true });

	// plugA & plugB off
	Core.do('interface|led|blink', { leds: ['belly', 'eye'], speed: 200, loop: 5 }, { delay: 50 });
	Core.do('interface|rfxcom|send', { device: 'plugA', value: false }, { delay: 60 });
	Core.do('interface|rfxcom|send', { device: 'plugB', value: false }, { delay: 60 });

	if (Core.isAwake()) {
		Core.do('service|context|sleep', null, { delay: GO_TO_SLEEP_DELAY });
	}
}

function beforeRestart() {
	log.info('beforeRestart');
	Core.do('interface|rfxcom|send', { device: 'plugB', value: true });
}

function renewCertbot() {
	log.INFO('renew Certbot certificate');
	// TODO y'a un truc car il faut intervenir dans le script
	// TODO use https://www.npmjs.com/package/greenlock
	Utils.execCmd('core certbot')
		.then(data => {
			log.info('core certificate successfully', data);
			resolve(lastDate[0]);
		})
		.catch(err => {
			Core.error('retreiveLastModifiedDate error', err);
			reject(err);
		});
}
