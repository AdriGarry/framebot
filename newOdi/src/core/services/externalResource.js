#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

const subject = { type: 'service', id: 'externalResource' };

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.service.mood.subscribe({
	next: flux => {
		log.info('External Resource service', flux);
	},
	error: err => { Odi.error(flux) }
});
