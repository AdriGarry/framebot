#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Module test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

module.exports.run = function(callback) {
	Flux.next('module', 'led', 'toggle', { leds: ['eye', 'nose', 'belly', 'satellite'], value: 1 });
	Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'Test sequence' });
	Flux.next('module', 'led', 'blink', { leds: ['eye', 'nose', 'belly', 'satellite'], speed: 800, loop: 10 }, 2);

	setTimeout(() => {}, 1000);

	setTimeout(() => {
		callback('moduleTest', true);
	}, 10000);
};
