#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.service.tools.subscribe({
	next: flux => {
		// if (!Flux.inspect(flux, subject)) return;
		log.info('Tools service', flux);
	},
	error: err => {
		Odi.error(flux);
	}
});
