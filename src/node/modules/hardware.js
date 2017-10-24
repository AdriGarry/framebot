#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

var Flux = require(Odi.CORE_PATH + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');

Flux.module.hardware.subscribe({
	next: flux => {
		log.info('Hardware module', flux);
	},
	error: err => {
		Odi.error(flux);
	}
});
