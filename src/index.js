#!/usr/bin/env node

'use strict';

const startTime = new Date();
console.log('\u2022');

const argv = process.argv;
console.log('argv', argv);
const name = process.argv[2];
const forcedParams = {
	debug: argv.includes('debug') ? true : false,
	sleep: argv.includes('sleep') ? true : false,
	test: argv.includes('test') ? true : false
};

global._PATH = __dirname.match(/\/.*\//g)[0];

const descriptor = require(_PATH + '_' + name + '/descriptor.json');

const Core = require('./core/Core').initializeContext(
	__filename.match(/\/.*\//g)[0],
	descriptor,
	forcedParams,
	startTime
);

const Flux = require('./api/Flux');

const log = new (require('./api/Logger'))(__filename, Core.conf('mode'));
log.debug('argv:', argv);

const Utils = require('./api/Utils');
log.info(' -->  ' + Core.Name + ' ready [' + Utils.executionTime(Core.startTime) + 'ms]');

////////  TEST section  ////////
if (Core.conf('mode') === 'test') {
	setTimeout(function() {
		new Flux('interface|tts|speak', { lg: 'en', msg: 'Integration tests sequence' });
		require('./test/integration/tests').launch();
	}, 1000);
}
