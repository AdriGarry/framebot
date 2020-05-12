#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
	{ id: 'beforeRestart', fn: beforeRestart },
	{ id: 'goToSleep', fn: goToSleep },
	{ id: 'certbot', fn: renewCertbot }
];

Observers.attachFluxParseOptions('service', 'task', FLUX_PARSE_OPTIONS);

const GO_TO_SLEEP_DELAY = 5 * 60;

function goToSleep() {
	log.info(`goToSleep in ${GO_TO_SLEEP_DELAY / 60} min`);

	// light
	new Flux('interface|hardware|light', GO_TO_SLEEP_DELAY);

	// radiator off
	new Flux('interface|rfxcom|send', { device: 'radiator', value: true });

	// plugA & plugB off
	new Flux('interface|led|blink', { leds: ['belly', 'eye'], speed: 200, loop: 5 }, { delay: 50 });
	new Flux('interface|rfxcom|send', { device: 'plugA', value: false }, { delay: 60 });
	// new Flux('interface|rfxcom|send', { device: 'plugB', value: false }, { delay: 60 });

	if (Core.isAwake()) {
		new Flux('service|context|sleep', null, { delay: GO_TO_SLEEP_DELAY });
	}
}

function beforeRestart() {
	log.info('beforeRestart');
	new Flux('interface|rfxcom|send', { device: 'plugB', value: true });
}

function renewCertbot() {
	log.INFO('renew Certbot certificate');
	// TODO y'a un truc car il faut intervenir dans le script
	// TODO use https://www.npmjs.com/package/greenlock
	Utils.execCmd('sudo framebot certbot') // TODO sudo useless ?
		.then(data => {
			log.info('core certificate successfully', data);
			resolve(lastDate[0]);
		})
		.catch(err => {
			Core.error('retreiveLastModifiedDate error', err);
			reject(err);
		});
}
