#!/usr/bin/env node

'use strict';

const startTime = new Date();
console.log('\u2022');

const argv = process.argv;
const name = process.argv[2];
const forcedParams = {
	debug: argv.indexOf('debug') > 0 ? true : false,
	sleep: argv.indexOf('sleep') > 0 ? true : false,
	test: argv.indexOf('test') > 0 ? true : false
};

global._PATH = __dirname.match(/\/.*\//g)[0];

const descriptor = require(_PATH + '_' + name + '/descriptor.json');
var Core = require(_PATH + 'src/core/Core.js').initializeContext(
	__filename.match(/\/.*\//g)[0],
	descriptor,
	forcedParams,
	startTime
);

const log = new (require(Core._CORE + 'Logger.js'))(__filename, Core.conf('mode'));
log.debug('argv', argv);

const Utils = require(Core._CORE + 'Utils.js');
log.info(' -->  ' + Core.Name + ' ready in ' + Utils.executionTime(startTime) + 'ms');

if (Core.conf('mode') == 'test') {
	////////  TEST section  ////////
	Core.do('interface|tts|speak', {
		lg: 'en',
		msg: 'test sequence'
	});
	setTimeout(function() {
		var testSequence = require(Core._SRC + 'test/tests.js').launch(function(testStatus) {
			let testTTS = Utils.rdm()
				? 'Je suis Ok !'
				: {
						lg: 'en',
						msg: 'all tests succeeded!'
				  };
			Core.do('interface|tts|speak', testTTS);
			setTimeout(function() {
				// if (testStatus) Core.do('interface|runtime|updateRestart', { mode: 'ready' });
				if (testStatus)
					Core.do('interface|runtime|updateRestart', {
						mode: 'ready'
					});
			}, 4000);
		});
	}, 1000);
}
