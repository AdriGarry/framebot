#!/usr/bin/env node

/** Odi's global variables & config */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.CONFIG = require(CONFIG_FILE);

/** Debug Mode */
if(CONFIG.debug) console.debug = function(o){console.log('\u2022 ' + o);}
else console.debug = function(o){};

/*if(CONFIG.debug) console.debug = console.log;
else console.debug = function(){};*/
console.debug('\n---------------------\n', '-> ->  DEBUG MODE !!');

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var hardware = require('./modules/hardware.js');
var gpioPins = require('./modules/gpioPins.js');
var CronJob = require('cron').CronJob;

var utils = require(CORE_PATH + 'modules/utils.js');
//utils.setConfig('startTime', new Date().getHours()+':'+new Date().getMinutes(), false);
utils.setConfig({mode: 'sleep', startTime: new Date().getHours()+':'+new Date().getMinutes()}, false);

var time = require('./modules/time.js');

var leds = require('./modules/leds.js');
var server = require('./controllers/server.js');
var jobs = require('./controllers/jobs.js');

var mode = sleepTime = process.argv[2]; // Retreive args

var introMsg = 'Odi\'s sleeping...';

if(sleepTime < 255){
	introMsg += ' for ' + sleepTime + 'h';
	console.log(introMsg + '   -.-');
	setTimeout(function(){ // Delay until restart awake
		hardware.restartOdi();
	}, sleepTime*60*60*1000);
}else{
	console.log(introMsg + '   -.-');
}

leds.activity(mode); // Activity flag 1/2

new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Activity flag 2/2
}, null, 0, 'Europe/Paris');

server.startUI(mode);

jobs.setBackgroundJobs();

new CronJob('0 * * * * *', function(){
	if(time.isAlarm()){
		console.log('Alarm... wake up !!');
		hardware.restartOdi();
	}
}, null, true, 'Europe/Paris');

ok.watch(function(err, value){ // Green button watch for restart awake
	console.log('Ok button pressed, canceling sleep mode & restarting Odi !');
	hardware.restartOdi();
});

var video = require(CORE_PATH + 'modules/video.js');
video.screenOff();
//video.off();
