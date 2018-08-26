#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
var log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Core._CORE + 'Utils.js');

log.info('Flux test sequence...');

const Rx = require('rxjs');
const assert = require('assert');
var Flux = require(Core._CORE + 'Flux.js');

module.exports.run = function(succeedTest) {
	Flux.next('service|max|blinkAllLed', null, { delay: 2, loop: 50 });

	assert.equal(Core.run('timer'), 0);
	Flux.next('service|time|timer');
	setImmediate(() => {
		assert.ok(Core.run('timer'));
	});

	Flux.next('service|time|today');

	Flux.next('service|max|playOneMelody');

	// Flux.next('service|voicemail|new', {msg: 'are you there ?'}, 8);
	// var rdmTTS = Core.ttsMessages.random[Utils.random(Core.ttsMessages.random.length)];
	let rdmTTS = Utils.randomItem(Core.ttsMessages.random);
	while (Array.isArray(rdmTTS)) {
		rdmTTS = Utils.randomItem(Core.ttsMessages.random); // Avoid conversation in voicemail.json
	}
	// var rdmTTS = Utils.randomItem(Core.ttsMessages.random);
	log.DEBUG(rdmTTS);
	Flux.next('service|voicemail|new', rdmTTS, { delay: 8 });
	Flux.next('service|voicemail|check', null, { delay: 11 });
	Flux.next('service|voicemail|clear', null, { delay: 15 });

	Flux.next('service|max|hornRdm');

	Flux.next('service|interaction|weather', 'random', { delay: 16 });

	setTimeout(() => {
		assert.equal(Core.run('voicemail'), 0);
		assert.equal(Core.errors.length, 0);
		succeedTest('serviceTest', true);
	}, 60000);
};
