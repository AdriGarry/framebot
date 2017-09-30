#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.module.led.subscribe({
	next: data => {
		log.info(data);
	},
	error: err => {
		log.info('error in timeService: ', err);
	}
});
