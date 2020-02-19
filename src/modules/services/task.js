#!/usr/bin/env node

'use strict';

const request = require('request');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

Core.flux.service.task.subscribe({
	next: flux => {
		if (flux.id == 'goToSleep') {
			goToSleep(flux.value);
		} else if (flux.id == 'onWakeUp') {
			onWakeUp(flux.value);
		} else if (flux.id == 'beforeWakeUp') {
			beforeWakeUp(flux.value);
		} else Core.error('unmapped flux in Task service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function goToSleep() {
	log.test('goToSleep');
}

function onWakeUp() {
	log.test('onWakeUp');
}

function beforeWakeUp() {
	log.test('beforeWakeUp');
}
