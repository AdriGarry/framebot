#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(Core._CORE + 'Utils.js');

log.info('Flux test sequence...');

module.exports.runTest = function(succeedTest) {
	return new Promise((resolve, reject) => {
		Core.do('service|max|blinkAllLed', null, { delay: 2, loop: 3 });

		Core.do('service|time|today');
		Core.do('service|weather|random');
		Core.do('service|weather|astronomy', null, { delay: 3 });

		assert.equal(Core.run('timer'), 0);
		Core.do('service|timer|increase');
		setImmediate(() => {
			assert.ok(Core.run('timer'));
		});

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
		Core.do('service|voicemail|clear', null, { delay: 30 });

		Core.do('service|max|hornRdm');

		Core.do('service|weather|report', 'random', { delay: 16 });

		setTimeout(() => {
			assert.equal(Core.run('voicemail'), 0);
			assert.equal(Core.errors.length, 0);
			resolve('serviceTest', true);
		}, 45 * 1000);
	});
};
