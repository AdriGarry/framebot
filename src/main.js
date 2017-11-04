#!/usr/bin/env node
'use strict';

const startTime = new Date();
console.log('.');
var Gpio = require('onoff').Gpio;
var eye = new Gpio(14, 'out').write(1);

const argv = process.argv;
const forcedDebug = argv.indexOf('debug') > 0 ? true : false;
const test = argv.indexOf('test') > 0 ? true : false;

// if (test) console.log('>> TEST MODE !!');
global.ODI_PATH = __dirname.match(/\/.*\//g)[0];
global.SRC_PATH = __dirname + '/';

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedDebug, test);

var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename, Odi.conf.debug); // Odi.conf.debug || forcedDebug
log.debug('argv', argv);

var Utils = require(Odi.CORE_PATH + 'Utils.js');
var Flux = require(Odi.CORE_PATH + 'Flux.js');
var Brain = require(Odi.CORE_PATH + 'Brain.js');

const observers = {
	modules: {
		sleep: ['led','hardware'],
		all: ['sound', 'tts']
	},
	controllers: {
		sleep: ['button', 'jobs'/*, 'server' */],
		all: []
	},
	services: {
		sleep: ['system', 'tools', 'voicemail'],
		all: ['time', 'music', 'mood', 'max', 'video']
	}
};

Object.keys(observers).forEach(function(observer) {
	let observersLoaded = '';
	for(let i = 0;i<observers[observer].sleep.length;i++){
		require(Odi.CORE_PATH + observer + '/' + observers[observer].sleep[i] + '.js');
	}
	observersLoaded += observers[observer].sleep.join(', ');
	if(Odi.conf.mode != 'sleep'){
		for(let i = 0;i<observers[observer].all.length;i++){
			require(Odi.CORE_PATH + observer + '/' + observers[observer].all[i] + '.js');
		}
		observersLoaded += ', '+observers[observer].all.join(', ');
	}

	log.info(observer, 'loaded:', observersLoaded);
});

log.info('Odi ready in' + Utils.getExecutionTime(startTime, '     ') + 'ms');

/////////////  TEST section  /////////////
if (test || Odi.conf.mode == 'test') {
	setTimeout(function() {
		var testSequence = require(SRC_PATH + 'test/tests.js').launch(function(testStatus) {
			// retour console + tts, and restart if test success
			setTimeout(function() {
				if (testStatus) Odi.update({ mode: 'ready' }, true);
			}, 2000);
		});
	}, 500);
}

if(Odi.conf.mode == 'sleep') Flux.next('service', 'system', 'restart', null, 20);
else Flux.next('service', 'system', 'restart', 'sleep', 20);

// var start = new Date();
// setTimeout(function(argument) {
// 	// execution time simulated with setTimeout function
// 	var end = new Date() - start;
// 	console.info('Execution time: %dms', end);
// }, 5000);
