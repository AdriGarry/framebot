#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {};

Core.flux.service.radiator.subscribe({
	next: flux => {
		if (flux.id == '') {
			//
		} else Core.error('unmapped flux in Radiator service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

// on/off

// scheduler

// timer
