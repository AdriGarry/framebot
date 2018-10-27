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
	Core.do('service|max|blinkAllLed', null, { delay: 2, loop: 50 });

	assert.equal(Core.run('timer'), 0);
	Core.do('service|time|timer');
	setImmediate(() => {
		assert.ok(Core.run('timer'));
	});

	Core.do('service|time|today');

	Core.do('service|max|playOneMelody');

	// Core.do('service|voicemail|new', {msg: 'are you there ?'}, 8);
	// var rdmTTS = Core.ttsMessages.random[Utils.random(Core.ttsMessages.random.length)];
	let rdmTTS = Utils.randomItem(Core.ttsMessages.random);
	while (Array.isArray(rdmTTS)) {
		rdmTTS = Utils.randomItem(Core.ttsMessages.random); // Avoid conversation in voicemail.json
	}
	// var rdmTTS = Utils.randomItem(Core.ttsMessages.random);
	log.DEBUG(rdmTTS);
	Core.do('service|voicemail|new', rdmTTS, { delay: 8 });
	Core.do('service|voicemail|check', null, { delay: 11 });
	Core.do('service|voicemail|clear', null, { delay: 15 });

	Core.do('service|max|hornRdm');

	Core.do('service|weather|report', 'random', { delay: 16 });

	setTimeout(() => {
		assert.equal(Core.run('voicemail'), 0);
		assert.equal(Core.errors.length, 0);
		succeedTest('serviceTest', true);
	}, 60000);
};
