#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Odi._CORE + 'Utils.js');

log.info('Module test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi._CORE + 'Flux.js');

const testTTSList = [{lg: 'en', msg: 'Test' },	{lg: 'fr', msg: 'Test' }];

module.exports.run = function(callback) {
	Flux.next('module', 'tts', 'speak', testTTSList[Utils.random(testTTSList.length)], null, null, true);
	Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly', 'satellite'], value: 0 }, 3, null, null, true);
	Flux.next('module', 'led', 'blink', { leds: ['belly'], speed: 700, loop: 100 }, 3, null, null, true);

	Flux.next('module', 'led', 'blink', { leds: ['belly'], speed: 700, loop: 100 }, 3, null, null, true);
	
	Flux.next('module', 'hardware', 'cpu', 3);

	setTimeout(() => {}, 1000);

	setTimeout(() => {
		Flux.next('module', 'sound', 'mute', { delay: 3, message: 'DELAY 3' });
		setTimeout(() => {
			callback('moduleTest', true);
		}, 5000);
	}, 30000);
};
