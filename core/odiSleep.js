#!/usr/bin/env node
'use strict'

var mode = sleepTime = process.argv[2]; // Retreive args
var introMsg = 'Odi\'s sleeping mode, context initialization...';

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;

/** Odi's global context */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.CONFIG = require(CONFIG_FILE);

global.ODI = {};

ODI.gpioPins = require('./modules/gpioPins.js');
ODI.hardware = require('./modules/hardware.js');
ODI.CronJob = require('cron').CronJob;
ODI.utils = require(CORE_PATH + 'modules/utils.js');
ODI.time = require('./modules/time.js');
ODI.leds = require('./modules/leds.js');
ODI.video = require(CORE_PATH + 'modules/video.js');
ODI.server = require('./controllers/server.js');
ODI.jobs = require('./controllers/jobs.js');


/** Debug Mode */
if(CONFIG.debug) console.debug = function(o){console.log('\u2022 ' + o);}
else console.debug = function(o){};
console.debug('-> ->  DEBUG MODE !!');

ODI.utils.setConfig({mode: 'sleep', startTime: new Date().getHours()+':'+new Date().getMinutes()}, false);

if(sleepTime < 255){
	introMsg += ' for ' + sleepTime + 'h';
	console.log(introMsg + '   -.-');
	setTimeout(function(){ // Delay until restart awake
		ODI.hardware.restartOdi();
	}, sleepTime*60*60*1000);
}else{
	console.log(introMsg + '   -.-');
}

ODI.leds.activity(mode); // Activity flag 1/2

new CronJob('*/3 * * * * *', function(){
	ODI.leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Activity flag 2/2
}, null, 0, 'Europe/Paris');

ODI.server.startUI(mode);

ODI.jobs.setBackgroundJobs();

new CronJob('0 * * * * *', function(){
	if(time.isAlarm()){
		console.log('Alarm... wake up !!');
		ODI.hardware.restartOdi();
	}
}, null, true, 'Europe/Paris');

ok.watch(function(err, value){ // Green button watch for restart awake
	console.log('Ok button pressed, canceling sleep mode & restarting Odi !');
	ODI.hardware.restartOdi();
});

ODI.video.screenOff();
