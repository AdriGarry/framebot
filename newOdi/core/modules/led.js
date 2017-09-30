#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.module.led.subscribe({
	next: flux => {
        if(!brain.inspect(flux)) return;
        log.info(flux);
	},
	error: err => {	log.info('error in timeService: ', err)	}
});
