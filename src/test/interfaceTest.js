#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
var log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Core._CORE + 'Utils.js');

log.info('Module test sequence...');

const assert = require('assert');

// const testTTSList = [{lg: 'en', msg: 'Test' },	{lg: 'fr', msg: 'Test' }];

module.exports.runTest = function(succeedTest) {
	//Core.do('interface|tts|speak', testTTSList[Utils.random(testTTSList.length)], null, null, true);
	// Core.do('interface|led|toggle', { leds: ['eye', 'belly', 'satellite'], value: 0 }, 3, null, null, true);
	// Core.do('interface|led|blink', { leds: ['belly'], speed: 600, loop: 100 });

	assert.ok(Core.conf());
	assert.equal(Core.conf('mode'), 'test');
	assert.ok(Core.isAwake());

	assert.ok(Core.run());
	assert.equal(Core.run('music'), false);
	assert.equal(Core.run('alarm'), false);

	Core.do('interface|sound|volume', 60);
	Core.do('interface|sound|volume', 40, { delay: 4 });

	Core.do('interface|hardware|cpuTTS', null, { delay: 0.1 });

	setTimeout(() => {
		assert.equal(Core.errors.length, 0);
		Core.do('interface|sound|mute', { delay: 3, message: 'DELAY 3' });
		setTimeout(() => {
			succeedTest('interfaceTest', true);
		}, 5000);
	}, 30 * 1000);
};
