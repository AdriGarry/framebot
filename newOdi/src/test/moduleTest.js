#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Module test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

module.exports.run = function(callback) {
	Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly', 'satellite'], value: 1 });
	Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'Test' });
	Flux.next('module', 'led', 'blink', { leds: ['eye', 'belly', 'satellite'], speed: 1000, loop: 15 });

	Flux.next('module', 'sound', 'mute', null, 5);

	setTimeout(() => {}, 1000);

	setTimeout(() => {
		callback('moduleTest', true);
	}, 7000);
};
