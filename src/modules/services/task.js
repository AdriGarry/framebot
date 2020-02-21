#!/usr/bin/env node

'use strict';

const request = require('request');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

Core.flux.service.task.subscribe({
	next: flux => {
		if (flux.id == 'beforeRestart') {
			beforeRestart();
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else Core.error('unmapped flux in Task service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function goToSleep() {
	log.test('goToSleep');
}

function beforeRestart() {
	log.test('beforeRestart');
	Core.do('interface|rfxcom|send', { device: 'plugB', value: true });
}
