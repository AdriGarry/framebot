#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

Flux.service.mood.subscribe({
	next: flux => {
		log.info('External Resource service', flux);
	},
	error: err => {
		Odi.error(flux);
	}
});
