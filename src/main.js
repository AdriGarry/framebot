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
	test: argv.indexOf('test') > 0 ? true : false};

global.ODI_PATH = __dirname.match(/\/.*\//g)[0];
// global.SRC_PATH = 'TOTO';

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedParams);
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
var CronJob = require('cron').CronJob;

const observers = {
	modules: {
		sleep: ['led','hardware'],
		all: ['sound', 'tts']
	},
	services: {
		sleep: ['conf', 'system', 'time', 'voicemail', 'video'],
		all: ['mood', 'interaction', 'music', 'max']
	},
	controllers: {
		sleep: ['button', 'jobs', 'server'],
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

log.info('--> Odi ready in' + Utils.getExecutionTime(startOdiTime, '     ') + 'ms');
Flux.next('module', 'conf', 'runtime');

// Flux.next('service', 'interaction', 'exclamation');
// Flux.next('service', 'interaction', 'random');


if (Odi.conf.mode == 'sleep') {
	new CronJob('0 * * * * *', function(){
		Flux.next('service', 'time', 'isAlarm');
	}, null, true, 'Europe/Paris');
	Flux.next('service', 'video', 'screenOff');

}else if (Odi.conf.mode == 'test') {
	/////////////  TEST section  /////////////
	setTimeout(function() {
		Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly', 'satellite'], value: 1 }, null, null, true);
		var testSequence = require(Odi._SRC + 'test/tests.js').launch(function(testStatus) {
			Flux.next('module', 'tts', 'speak', {lg: 'en', msg: 'all tests succeeded!'})
			setTimeout(function() {
				if (testStatus) Flux.next('module', 'conf', 'updateRestart', { mode: 'ready' });
			}, 3000);
		});
	}, 500);
}else{
	// Alarm / Cocorico...
	Flux.next('service', 'time', 'isAlarm');
	new CronJob('2 * * * * *', function(){
		Flux.next('service', 'time', 'isAlarm', null, null, null, true);
	}, null, true, 'Europe/Paris');
	if(!Odi.run.alarm){
		Flux.next('service', 'voicemail', 'check');
	}
}

// Flux.next('service', 'interaction', 'random', null, 7, 4);

// var start = new Date();
// setTimeout(function(argument) {
// 	// execution time simulated with setTimeout function
// 	var end = new Date() - start;
// 	console.info('Execution time: %dms', end);
// }, 5000);

