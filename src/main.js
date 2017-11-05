#!/usr/bin/env node
'use strict';

const startOdiTime = new Date();
console.log('.');
// var Gpio = require('onoff').Gpio;
// var eye = new Gpio(14, 'out').write(1);

const argv = process.argv;
const forcedDebug = argv.indexOf('debug') > 0 ? true : false;
const test = argv.indexOf('test') > 0 ? true : false;

// if (test) console.log('>> TEST MODE !!');
global.ODI_PATH = __dirname.match(/\/.*\//g)[0];
global.SRC_PATH = 'TOTO';

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedDebug, test);
var spawn = require('child_process').spawn;
if(Odi.conf.mode != 'sleep'){
	spawn('sh', [ODI_PATH + 'src/shell/init.sh']);
	spawn('sh', [ODI_PATH + 'src/shell/sounds.sh', 'odi', 'noLeds']);
}

var log = new (require(Odi._CORE + 'Logger.js'))(__filename, Odi.conf.debug);
log.debug('argv', argv);

var Utils = require(Odi._CORE + 'Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var Brain = require(Odi._CORE + 'Brain.js');

const observers = {
	modules: {
		sleep: ['led','hardware'],
		all: ['sound', 'tts']
	},
	controllers: {
		sleep: ['button', 'jobs', 'server'],
	},
	services: {
		sleep: ['system', 'tools', 'voicemail'],
		all: ['time', 'music', 'mood', 'max', 'video']
	}
};

Object.keys(observers).forEach(function(observer) {
	let observersLoaded = '';
	for(let i = 0;i<observers[observer].sleep.length;i++){
		require(Odi._CORE + observer + '/' + observers[observer].sleep[i] + '.js');
	}
	observersLoaded += observers[observer].sleep.join(', ');
	if(Odi.conf.mode != 'sleep' && observers[observer].hasOwnProperty('all')){
		for(let i = 0;i<observers[observer].all.length;i++){
			require(Odi._CORE + observer + '/' + observers[observer].all[i] + '.js');
		}
		observersLoaded += ', '+observers[observer].all.join(', ');
	}

	log.info(observer, 'loaded:', observersLoaded);
});

log.info('Odi ready in' + Utils.getExecutionTime(startOdiTime, '     ') + 'ms');


/////////////  TEST section  /////////////
if (test || Odi.conf.mode == 'test') {
	setTimeout(function() {
		var testSequence = require(Odi._SRC + 'test/tests.js').launch(function(testStatus) {
			// retour console + tts, and restart if test success
			Flux.next('module', 'tts', 'speak', {lg: 'en', msg: 'all tests succeeded!'})
			setTimeout(function() {
				if (testStatus) Odi.update({ mode: 'ready' }, true);
			}, 3000);
		});
	}, 500);
}

// var start = new Date();
// setTimeout(function(argument) {
// 	// execution time simulated with setTimeout function
// 	var end = new Date() - start;
// 	console.info('Execution time: %dms', end);
// }, 5000);

// setTimeout(function() {
// 	Flux.next('service', 'time', 'now');
// }, 5000);
