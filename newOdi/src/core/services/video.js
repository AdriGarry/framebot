#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

const subject = { type: 'service', id: 'video' };

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.service.video.subscribe({
	next: flux => {
		// if (!Flux.inspect(flux, subject)) return;
		log.info('Video service', flux);
	},
	error: err => { Odi.error(flux) }
});
