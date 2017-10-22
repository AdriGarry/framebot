#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

// const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.controller.button.subscribe({
	next: flux => {
		buttonHandler(flux);
	},
	error: err => {
		Odi.error(flux);
	}
});

Flux.controller.jobs.subscribe({
	next: (flux, flux2) => {
		jobsHandler(flux);
	},
	error: err => {
		Odi.error(err);
	}
});

function buttonHandler(flux) {
	if (flux.id == 'ok') {
		Flux.service.time.next({ id: 'bip', value: 'ok' });
	} else if (flux.id == 'cancel') {
		if (flux.value < 1) {
			Flux.next('module', 'sound', 'mute');
		} else if (flux.value >= 1 && flux.value < 3) {
			// process.exit();
			Flux.next('service', 'system', 'restart', 'ready');
		} else {
			Flux.next('service', 'system', 'restart', 'test');
		}
		// } else if (flux.id == 'blue') {
		// Odi.error(flux);
	} else {
		log.info('Button->else', flux);
	}
}

function jobsHandler(flux) {
	if (flux.id == 'clock') {
		Flux.service.time.next({ id: 'now', value: null });
	} else if (flux.id == 'sound') {
		Flux.module.led.next({
			id: 'blink',
			value: { leds: ['nose'], speed: 100, loop: 1 }
		});
	} else {
		log.info('Jobs->else', flux);
	}
}

log.info('Brain ready'); //loaded/compiled
