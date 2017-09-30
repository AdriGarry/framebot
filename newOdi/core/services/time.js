#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.service.time.subscribe({
	next: flux => {
		if(!brain.inspect(flux)) return;
		log.info('Time[' + flux.id + ']', flux.value, flux.delay);
	},
	error: err => { log.info('error in timeService: ', err)	}
});
