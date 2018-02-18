#!/usr/bin/env node
'use strict';

const startOdiTime = new Date();
console.log('.');
// var Gpio = require('onoff').Gpio;
// var eye = new Gpio(14, 'out').write(1);

const argv = process.argv;
const forcedParams = {
	debug: argv.indexOf('debug') > 0 ? true : false,
	sleep: argv.indexOf('sleep') > 0 ? true : false,
	test: argv.indexOf('test') > 0 ? true : false
};

global.ODI_PATH = __dirname.match(/\/.*\//g)[0];

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedParams);
var spawn = require('child_process').spawn;
if (Odi.isAwake()) {
	spawn('sh', [ODI_PATH + 'src/shell/init.sh']);
	spawn('sh', [ODI_PATH + 'src/shell/sounds.sh', 'odi', 'noLeds']);
}

var log = new (require(Odi._CORE + 'Logger.js'))(__filename, Odi.conf('debug'), Odi.conf('mode'));
log.debug('argv', argv);

var Utils = require(Odi._CORE + 'Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');

const observers = {
	modules: {
		base: ['runtime', 'led', 'sound', 'hardware', 'arduino'],
		full: ['tts']
	},
	controllers: {
		base: ['button', 'jobs', 'server']
	},
	services: {
		base: ['handler', 'system', 'time', 'voicemail', 'video'],
		full: ['mood', 'interaction', 'music', 'party', 'max']
	}
};

Object.keys(observers).forEach(function(observer) {
	// log.info('loading ', observer + '...');
	let observersLoaded = '';
	for (let i = 0; i < observers[observer].base.length; i++) {
		require(Odi._CORE + observer + '/' + observers[observer].base[i] + '.js');
	}
	observersLoaded += observers[observer].base.join(', ');
	if (Odi.isAwake() && observers[observer].hasOwnProperty('full')) {
		for (let i = 0; i < observers[observer].full.length; i++) {
			require(Odi._CORE + observer + '/' + observers[observer].full[i] + '.js');
		}
		observersLoaded += ', ' + observers[observer].full.join(', ');
	}
	log.info(observer, 'loaded:', observersLoaded);
});
// console.log(module.loaded);
log.info('--> Odi ready in' + Utils.getExecutionTime(startOdiTime, '     ') + 'ms');

if (!Odi.isAwake()) {
	Flux.next('service', 'video', 'screenOff');
} else if (Odi.conf('mode') == 'test') {
	/////////////  TEST section  /////////////
	Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'test sequence' });
	setTimeout(function() {
		var testSequence = require(Odi._SRC + 'test/tests.js').launch(function(testStatus) {
			Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'all tests succeeded!' });
			setTimeout(function() {
				if (testStatus) Flux.next('module', 'runtime', 'updateRestart', { mode: 'ready' });
			}, 3000);
		});
	}, 1000);
} else {
	if (!Odi.run('alarm')) {
		Flux.next('service', 'voicemail', 'check');
	}
}
Flux.next('module', 'runtime', 'refresh');

const HORNS = [
	'playHornWarning',
	'playHornDoUp',
	'playHorn',
	'playHornOff',
	'playHornFire',
	'playHornWhistle',
	'playHornOvni',
	'playHornBombing',
	'playHornSiren',
	'playHornDown'
];

if (Odi.isAwake() && !Odi.run('alarm')) {
	// Flux.next('module', 'arduino', 'write', 'Blink-1-2-3', 3);
	// Flux.next('module', 'arduino', 'write', 'playOneMelody', 7, 2);
	// Flux.next('module', 'arduino', 'write', 'playRdmHorn', 5, 1);

	let delay = 10;
	HORNS.forEach(item => {
		//Flux.next('module', 'arduino', 'write', item, delay);
		delay = delay + 10;
	});
}

// Flux.next('module', 'arduino', 'write', 'playRdmHorn', 90, 5);
// Odi.next('module', 'arduino', 'write', 'playRdmHorn', 90, 5);
// Odi.do('module', 'arduino', 'write', 'playRdmHorn', 90, 5);

// Flux.next('module', 'sound', 'play', { mp3: 'system/beBack.mp3' });
// Flux.next('module', 'sound', 'play', { mp3: 'jukebox/CDuncan-Say.mp3', position: 7 }, 2);

// Utils.getMp3Duration(Odi._MP3 + 'system/birthday.mp3', function(data) {
// 	log.info(data);
// });

// setTimeout(function() {
// 	Utils.getMp3Duration(Odi._MP3 + 'system/birthday.mp3', function(data) {
// 		log.info(data);
// 	});
// }, 1000);

// var start = new Date();
// setTimeout(function(argument) {
// 	// execution time simulated with setTimeout function
// 	var end = new Date() - start;
// 	console.info('Execution time: %dms', end);
// }, 5000);

// setTimeout(() => {
// 	console.log('after timeout', module.loaded);
// }, 1);
// console.log('EOF', module.loaded);
