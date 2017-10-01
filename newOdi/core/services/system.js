#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

const subject = {type:'service', id: 'system'};

var Flux = require (Odi.CORE_PATH + 'Flux.js');

Flux.service.system.subscribe({
	next: flux => {
		if(!Flux.inspect(flux, subject)) return;
		log.info('Service System', flux);
	},
	error: err => { Odi.error(flux) }
});
