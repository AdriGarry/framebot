#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {};

Core.flux.service.radiator.subscribe({
	next: flux => {
		if (flux.id == 'setState') {
			setState(flux.value);
		} else if (flux.id == 'timer') {
			timer(flux.value);
		} else if (flux.id == 'scheduler') {
			resetScheduler();
		} else Core.error('unmapped flux in Radiator service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	scheduler();
});

// on/off
function setState(state) {
	//
}

// timer
function timer(time) {
	//
}

function resetScheduler() {
	//
}

// scheduler => cron
function scheduler() {
	//
}
