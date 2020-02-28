#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Core = require('./../core/Core').Core;

const log = new (require('./../api/Logger'))(__filename.match(/(\w*).js/g)[0]),
	Flux = require('./../api/Flux');

log.info('Module test sequence...');

// const testTTSList = [{lg: 'en', msg: 'Test' },	{lg: 'fr', msg: 'Test' }];

module.exports.runTest = function(succeedTest) {
	return new Promise((resolve, reject) => {
		// new Flux('interface|tts|speak', testTTSList[Utils.random(testTTSList.length)]);
		// new Flux('interface|led|toggle', { leds: ['eye', 'belly', 'satellite'], value: 0 });
		// new Flux('interface|led|blink', { leds: ['belly'], speed: 600, loop: 100 }, { delay: 3 });

		assert.ok(Core.conf());
		assert.equal(Core.conf('mode'), 'test');
		assert.ok(Core.isAwake());

		assert.ok(Core.run());
		assert.equal(Core.run('music'), false);
		assert.equal(Core.run('alarm'), false);

		new Flux('interface|sound|volume', 60);
		new Flux('interface|sound|volume', 40, { delay: 4 });

		new Flux('interface|hardware|cpuTTS', null, { delay: 1 });

		setTimeout(() => {
			assert.equal(Core.errors.length, 0);
			new Flux('interface|sound|mute', { delay: 5, message: 'DELAY 3' });
			setTimeout(() => {
				if (Core.errors.length > 0) reject('interfaceTest');
				resolve('interfaceTest');
			}, 5000);
		}, 50 * 1000);
	});
};
