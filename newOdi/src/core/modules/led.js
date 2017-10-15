#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

const subject = { type: 'module', id: 'led' };

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.module.led.subscribe({
	next: flux => {
		// if (!Flux.inspect(flux, subject)) return;
		log.info(flux, '(you are in the led module !)');
	},
	error: err => { Odi.error(flux) }
});
