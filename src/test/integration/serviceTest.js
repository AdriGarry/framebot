#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Core = require('../../core/Core').Core;

const log = new (require('../../api/Logger'))(__filename),
	Flux = require('../../api/Flux'),
	Utils = require('../../api/Utils');

log.info('Flux test sequence...');

module.exports.runTest = function (succeedTest) {
	return new Promise((resolve, reject) => {
		new Flux('service|max|blinkAllLed', null, { delay: 2, loop: 3 });

		assert.strictEqual(Core.run('timer'), 0);
		new Flux('service|timer|increase');
		setImmediate(() => {
			assert.ok(Core.run('timer'));
		});

		new Flux('service|max|playOneMelody');

		// new Flux('service|voicemail|new', {msg: 'are you there ?'}, 8);
		// var rdmTTS = Core.ttsMessages.random[Utils.random(Core.ttsMessages.random.length)];
		let rdmTTS = Utils.randomItem(Core.ttsMessages.random);
		while (Array.isArray(rdmTTS)) {
			rdmTTS = Utils.randomItem(Core.ttsMessages.random); // Avoid conversation in voicemail.json
		}
		// var rdmTTS = Utils.randomItem(Core.ttsMessages.random);
		log.DEBUG(rdmTTS);
		new Flux('service|voicemail|new', rdmTTS, { delay: 8 });
		new Flux('service|voicemail|check', null, { delay: 11 });
		new Flux('service|voicemail|clear', null, { delay: 30 });

		new Flux('service|max|hornRdm');

		new Flux('service|weather|report', 'random', { delay: 16 });

		setTimeout(() => {
			assert.strictEqual(Core.run('voicemail'), 0);
			assert.strictEqual(Core.errors.length, 0);
			if (Core.errors.length > 0) reject('serviceTest');
			resolve('serviceTest');
		}, 55 * 1000);
	});
};
