#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

module.exports = {};

Core.flux.interface.radio433Mhz.subscribe({
	next: flux => {
		if (flux.id == 'send') {
			send(flux.value);
		} else {
			Core.error('unmapped flux in radio433Mhz interface', flux, false);
		}
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	// do something, or useless?
});

/** Function to... */
function send(data) {
	log.info('radio433Mhz:', data);
}
