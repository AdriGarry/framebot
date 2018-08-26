#!/usr/bin/env node
'use strict';

const startTime = new Date();
console.log('\u2022');

const argv = process.argv;
const forcedParams = {
	debug: argv.indexOf('debug') > 0 ? true : false,
	sleep: argv.indexOf('sleep') > 0 ? true : false,
	test: argv.indexOf('test') > 0 ? true : false
};

global._PATH = __dirname.match(/\/.*\//g)[0];

const descriptor = require(_PATH + 'data/descriptor.json');

var Core = require(_PATH + 'src/core/Core.js').init(
	__filename.match(/\/.*\//g)[0],
	descriptor,
	forcedParams,
	startTime
);
const spawn = require('child_process').spawn;
if (Core.isAwake()) {
	spawn('sh', [_PATH + 'src/shell/init.sh']);
	spawn('sh', [_PATH + 'src/shell/sounds.sh', 'odi', 'noLeds']);
}

const log = new (require(Core._CORE + 'Logger.js'))(__filename, Core.conf('mode'));
// log.setMode(Core.conf('log'));
log.debug('argv', argv);

const Utils = require(Core._CORE + 'Utils.js');
const Flux = require(Core._CORE + 'Flux.js').loadModules(descriptor.modules);

log.info('--> ' + Core.name + ' ready in ' + Utils.executionTime(startTime) + 'ms');

if (!Core.isAwake()) {
	Flux.next('interface|video|screenOff');
} else if (Core.conf('mode') == 'test') {
	////////  TEST section  ////////
	Flux.next('interface|tts|speak', { lg: 'en', msg: 'test sequence' });
	setTimeout(function() {
		var testSequence = require(Core._SRC + 'test/tests.js').launch(function(testStatus) {
			let testTTS = Utils.rdm() ? 'Je suis Ok !' : { lg: 'en', msg: 'all tests succeeded!' };
			Flux.next('interface|tts|speak', testTTS);
			setTimeout(function() {
				// if (testStatus) Flux.next('interface|runtime|updateRestart', { mode: 'ready' });
				if (testStatus) Flux.next('interface|runtime|updateRestart', { mode: 'ready' });
			}, 3000);
		});
	}, 1000);
} else {
	Flux.next('service|time|isAlarm'); // Alarm / Cocorico...
	if (!Core.run('alarm')) {
		Flux.next('service|voicemail|check');
	}
}
Flux.next('interface|runtime|refresh');

if (Core.conf('watcher')) {
	Flux.next('controller|watcher|startWatch');
}

if (Core.isAwake() && !Core.run('alarm')) {
	// Flux.next('interface|arduino|write', 'Blink-1-2-3', { delay: 3 });
	// Flux.next('service|max|playOneMelody', null, { delay: 13, loop: 2 });
}

// var arr = ['aaa', 'bbb'];
// console.log('---->');

// for (var i = 0; i < 13; i++) {
// 	console.log(Utils.randomItem(arr));
// 	// console.log(Utils.random(2));
// }

if (Core.isAwake() && Core.conf('watcher')) {
	// TODO put this in a callable function from UI!
	for (var i = 0, tts; (tts = Core.ttsMessages.random[i]); i++) {
		//Flux.next('interface|tts|speak', tts, { delay: 2 });
	}
}

// const RandomBox = require('randombox').RandomBox;
// console.log(RandomBox);
// let toto = new RandomBox(Core.ttsMessages.goToSleep);
// for (var i = 0; i < 15; i++) {
// 	console.log(toto.next());
// }
// console.log('\n--> RANDOM BOX TO PACKAGE TO NPM !!\n');

// Flux.next('interface|arduino|write', 'playRdmHorn', 90, 5);
// Core.next('interface', 'arduino', 'write', 'playRdmHorn', 90, 5);
// Core.do('interface', 'arduino', 'write', 'playRdmHorn', 90, 5);

// Flux.next('interface|sound|play', { mp3: 'system/beBack.mp3' });
// Flux.next('interface|sound|play', { mp3: 'jukebox/CDuncan-Say.mp3', position: 7 }, 2);

// setTimeout(function() {
// 	Utils.getMp3Duration(Core._MP3 + 'system/birthday.mp3', function(data) {
// 		log.info(data);
// 	});
// }, 1000);
