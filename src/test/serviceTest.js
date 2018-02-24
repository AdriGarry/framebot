#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Odi._CORE + 'Utils.js');

log.info('Flux test sequence...');

const Rx = require('rxjs');
const assert = require('assert');
var Flux = require(Odi._CORE + 'Flux.js');

module.exports.run = function(succeedTest) {
	assert.equal(Odi.run('timer'), 0);
	Flux.next('service', 'time', 'timer');
	setImmediate(() => {
		assert.ok(Odi.run('timer'));
	});

	Flux.next('service', 'time', 'today');

	// Flux.next('service', 'voicemail', 'new', {msg: 'are you there ?'}, 8);
	// var rdmTTS = Odi.ttsMessages.randomTTS[Utils.random(Odi.ttsMessages.randomTTS.length)];
	let rdmTTS = Utils.randomItem(Odi.ttsMessages.randomTTS);
	while (Array.isArray(rdmTTS)) {
		rdmTTS = Utils.randomItem(Odi.ttsMessages.randomTTS); // Avoid conversation in voicemail.json
	}
	// var rdmTTS = Utils.randomItem(Odi.ttsMessages.randomTTS);
	log.DEBUG(rdmTTS);
	Flux.next('service', 'voicemail', 'new', rdmTTS, 8);
	Flux.next('service', 'voicemail', 'check', null, 11);
	Flux.next('service', 'voicemail', 'clear', null, 15);

	Flux.next('service', 'interaction', 'weather', 'random', null, 16);

	setTimeout(() => {
		assert.equal(Odi.run('voicemail'), 0);
		assert.equal(Odi.errors.length, 0);
		succeedTest('serviceTest', true);
	}, 50000);
};
