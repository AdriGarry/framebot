#!/usr/bin/env node
'use strict';

const startTime = new Date();
console.log('.');

const argv = process.argv;
const forcedParams = {
	debug: argv.indexOf('debug') > 0 ? true : false,
	sleep: argv.indexOf('sleep') > 0 ? true : false,
	test: argv.indexOf('test') > 0 ? true : false
};

global.ODI_PATH = __dirname.match(/\/.*\//g)[0];

var descriptor = require(ODI_PATH + 'data/descriptor.json');

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(
	__filename.match(/\/.*\//g)[0],
	descriptor,
	forcedParams,
	startTime
);
var spawn = require('child_process').spawn;
if (Odi.isAwake()) {
	spawn('sh', [ODI_PATH + 'src/shell/init.sh']);
	spawn('sh', [ODI_PATH + 'src/shell/sounds.sh', 'odi', 'noLeds']);
}

var log = new (require(Odi._CORE + 'Logger.js'))(__filename, Odi.conf('debug'), Odi.conf('mode'));
log.debug('argv', argv);

var Utils = require(Odi._CORE + 'Utils.js');

var Flux = require(Odi._CORE + 'Flux.js').loadModules(descriptor.modules);

log.info('--> Odi ready in ' + Utils.executionTime(startTime) + 'ms');

if (!Odi.isAwake()) {
	Flux.next('interface', 'video', 'screenOff');
} else if (Odi.conf('mode') == 'test') {
	/////////////  TEST section  /////////////
	Flux.next('interface', 'tts', 'speak', { lg: 'en', msg: 'test sequence' });
	setTimeout(function() {
		var testSequence = require(Odi._SRC + 'test/tests.js').launch(function(testStatus) {
			let testTTS = Utils.rdm() ? 'Je suis Ok !' : { lg: 'en', msg: 'all tests succeeded!' };
			Flux.next('interface', 'tts', 'speak', testTTS);
			setTimeout(function() {
				if (testStatus) Flux.next('interface', 'runtime', 'updateRestart', { mode: 'ready' });
			}, 3000);
		});
	}, 1000);
} else {
	Flux.next('service', 'time', 'isAlarm'); // Alarm / Cocorico...
	if (!Odi.run('alarm')) {
		Flux.next('service', 'voicemail', 'check');
	}
}
Flux.next('interface', 'runtime', 'refresh');

if (Odi.conf('watcher')) {
	Flux.next('controller', 'watcher', 'startWatch');
}

if (Odi.isAwake() && !Odi.run('alarm')) {
	// Flux.next('interface', 'arduino', 'write', 'Blink-1-2-3', 3);
	// Flux.next('interface', 'arduino', 'write', 'playOneMelody', 7, 2);
	// Flux.next('interface', 'arduino', 'write', 'playRdmHorn', 5, 1);
	// Flux.next('interface', 'arduino', 'write', 'playHornWhistle', 10);
}

// Flux.next('interface', 'arduino', 'write', 'playRdmHorn', 90, 5);
// Odi.next('interface', 'arduino', 'write', 'playRdmHorn', 90, 5);
// Odi.do('interface', 'arduino', 'write', 'playRdmHorn', 90, 5);

// Flux.next('interface', 'sound', 'play', { mp3: 'system/beBack.mp3' });
// Flux.next('interface', 'sound', 'play', { mp3: 'jukebox/CDuncan-Say.mp3', position: 7 }, 2);

// setTimeout(function() {
// 	Utils.getMp3Duration(Odi._MP3 + 'system/birthday.mp3', function(data) {
// 		log.info(data);
// 	});
// }, 1000);

// setTimeout(() => {
// 	console.log('after timeout', module.loaded);
// }, 1);
// console.log('EOF', module.loaded);
