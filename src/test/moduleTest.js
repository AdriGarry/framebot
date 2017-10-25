#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Module test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

const testTTSList = ['Test', 'T', 'TT'];

module.exports.run = function(callback) {
	Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly', 'satellite'], value: 1 });

	Flux.next('module', 'tts', 'speak', { lg: 'en', msg: testTTSList[Math.floor(Math.random() * testTTSList.length)] });

	Flux.next('module', 'led', 'blink', { leds: ['belly'], speed: 900, loop: 10 });

	Flux.next('module', 'sound', 'mute', { delay: 7, message: 'DELAY 7' }, 3); //5
	Flux.next('module', 'sound', 'mute', { delay: 13, message: 'DELAY 13' }, 3);

	setTimeout(() => {}, 1000);

	setTimeout(() => {
		callback('moduleTest', true);
	}, 40000);
};
