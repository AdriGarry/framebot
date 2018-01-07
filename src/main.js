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
// global.SRC_PATH = 'TOTO';

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedParams);
var spawn = require('child_process').spawn;
if (Odi.isAwake()) {
	spawn('sh', [ODI_PATH + 'src/shell/init.sh']);
	spawn('sh', [ODI_PATH + 'src/shell/sounds.sh', 'odi', 'noLeds']);
}

var log = new (require(Odi._CORE + 'Logger.js'))(__filename, Odi.conf.debug);
log.debug('argv', argv);

var Utils = require(Odi._CORE + 'Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var Brain = require(Odi._CORE + 'Brain.js');
var CronJob = require('cron').CronJob;

const observers = {
	modules: {
		sleep: ['led', 'sound', 'hardware', 'arduino'],
		all: ['tts']
	},
	services: {
		sleep: ['conf', 'system', 'time', 'voicemail', 'video'],
		all: ['mood', 'interaction', 'music', 'party', 'max']
	},
	controllers: {
		sleep: ['button', 'jobs', 'server']
	}
};

Object.keys(observers).forEach(function(observer) {
	let observersLoaded = '';
	for (let i = 0; i < observers[observer].sleep.length; i++) {
		require(Odi._CORE + observer + '/' + observers[observer].sleep[i] + '.js');
	}
	observersLoaded += observers[observer].sleep.join(', ');
	if (Odi.isAwake() && observers[observer].hasOwnProperty('all')) {
		for (let i = 0; i < observers[observer].all.length; i++) {
			require(Odi._CORE + observer + '/' + observers[observer].all[i] + '.js');
		}
		observersLoaded += ', ' + observers[observer].all.join(', ');
	}

	log.info(observer, 'loaded:', observersLoaded);
});

Flux.next('module', 'conf', 'runtime');
log.info('--> Odi ready in' + Utils.getExecutionTime(startOdiTime, '     ') + 'ms');

// Flux.next('service', 'interaction', 'exclamation');
// Flux.next('service', 'interaction', 'random');

if (Odi.conf.mode == 'sleep') {
	Flux.next('module', 'arduino', 'write', 'break', 3, 2); // sending twice, just in case...
	new CronJob(
		'0 * * * * *',
		function() {
			Flux.next('service', 'time', 'isAlarm', null, null, null, true);
		},
		null,
		true,
		'Europe/Paris'
	);
	Flux.next('service', 'video', 'screenOff');
} else if (Odi.conf.mode == 'test') {
	/////////////  TEST section  /////////////
	Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'test sequence' });
	setTimeout(function() {
		// Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly', 'satellite'], value: 1 }, null, null, true);
		var testSequence = require(Odi._SRC + 'test/tests.js').launch(function(testStatus) {
			Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'all tests succeeded!' });
			setTimeout(function() {
				if (testStatus) Flux.next('module', 'conf', 'updateRestart', { mode: 'ready' });
			}, 3000);
		});
	}, 1000);
} else {
	// Alarm / Cocorico...
	Flux.next('service', 'time', 'isAlarm');
	new CronJob(
		'2 * * * * *',
		function() {
			Flux.next('service', 'time', 'isAlarm', null, null, null, true);
		},
		null,
		true,
		'Europe/Paris'
	);
	if (!Odi.run.alarm) {
		Flux.next('service', 'voicemail', 'check');
	}
	if (!Odi.run.etat) Flux.next('module', 'arduino', 'write', 'break', 10 * 60); // todo : a metter dans une fonction sleep()
	if (!Odi.run.etat) Flux.next('module', 'arduino', 'write', 'break', 10 * 60);

	Flux.next('module', 'arduino', 'write', 'Blink-1-2-3', 3);
	Flux.next('module', 'arduino', 'write', 'Blink-123', 5);
}

// if (Odi.isAwake()) {
// 	Flux.next('module', 'arduino', 'write', 'Salut mon loulou !'.toUpperCase(), 1, 2);
// 	Flux.next('module', 'arduino', 'write', 'break', 7);
// 	Flux.next('module', 'arduino', 'write', 'hi', 120);
// }

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

// Flux.next('module', 'sound', 'mute', { message: 'Auto Mute FIP', delay: 2 }, 10);

// var start = new Date();
// setTimeout(function(argument) {
// 	// execution time simulated with setTimeout function
// 	var end = new Date() - start;
// 	console.info('Execution time: %dms', end);
// }, 5000);

// Flux.next('service', 'party', 'pirate', null, 2, 2);
// Flux.next('service', 'party', 'pirate', 'full', 3);

// for (var i = 0; i < 20; i++) {
// 	console.log(Utils.random());
// }
