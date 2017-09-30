#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
console.log('TimeService>Odi.CORE_PATH:' + Odi.CORE_PATH);
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.led.subscribe({
	next: data => {
		log.info('timeService: ', data);
	},
	error: err => {
		log.info('error in timeService: ', err);
	}
});
