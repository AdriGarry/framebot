#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Odi._CORE + 'Utils.js');

log.info('Module test sequence...');

const Rx = require('rxjs');
const assert = require('assert');
var Flux = require(Odi._CORE + 'Flux.js');

// const testTTSList = [{lg: 'en', msg: 'Test' },	{lg: 'fr', msg: 'Test' }];

module.exports.run = function(succeedTest) {
	//Flux.next('module', 'tts', 'speak', testTTSList[Utils.random(testTTSList.length)], null, null, true);
	// Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly', 'satellite'], value: 0 }, 3, null, null, true);
	Flux.next('module', 'led', 'blink', { leds: ['belly'], speed: 600, loop: 100 });

	assert.ok(Odi.conf());
	assert.equal(Odi.conf('mode'), 'test');
	assert.ok(Odi.isAwake());

	assert.ok(Odi.run());
	assert.equal(Odi.run('music'), false);
	assert.equal(Odi.run('alarm'), false);

	Flux.next('module', 'hardware', 'cpuTTS', null, 0.1);

	setTimeout(() => {
		assert.equal(Odi.errors.length, 0);
		Flux.next('module', 'sound', 'mute', { delay: 3, message: 'DELAY 3' });
		setTimeout(() => {
			succeedTest('moduleTest', true);
		}, 5000);
	}, 30000);
};
