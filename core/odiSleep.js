#!/usr/bin/env node
'use strict'

var mode = process.argv[2]; // Retreive args

var spawn = require('child_process').spawn;
var util = require('util');
var Gpio = require('onoff').Gpio;
var CronJob = require('cron').CronJob;

/** Odi's global context */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.CONFIG = require(CONFIG_FILE);

var fs = require('fs');
var logo = fs.readFileSync(DATA_PATH + 'odiLogoSleep.properties', 'utf8').toString().split('\n');
console.log('\n\n' + logo.join('\n'));

/** Debug Mode */
if(CONFIG.debug) require(CORE_PATH + 'modules/debug.js');
else console.debug = function(){};

global.ODI = {};
global.ODI.utils = require(CORE_PATH + 'modules/utils.js');
ODI.utils.setConfigSync({startTime: ODI.utils.logTime('h:m (D/M)')}, false);

console.log('Odi\'s sleeping mode context initializing...');
global.ODI.leds = require(CORE_PATH + 'modules/leds.js');
global.ODI.CronJob = require('cron').CronJob;
global.ODI.time = require(CORE_PATH + 'modules/time.js');
global.ODI.voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
global.ODI.video = require(CORE_PATH + 'modules/video.js');
global.ODI.tts = require(CORE_PATH + 'modules/tts.js');
global.ODI.hardware = require(CORE_PATH + 'modules/hardware.js');
global.ODI.jukebox = require(CORE_PATH + 'modules/jukebox.js');
global.ODI.exclamation = require(CORE_PATH + 'modules/exclamation.js');
global.ODI.fip = require(CORE_PATH + 'modules/fip.js');
global.ODI.video = require(CORE_PATH + 'modules/video.js');
global.ODI.party = require(CORE_PATH + 'modules/party.js');
global.ODI.admin = require(CORE_PATH + 'modules/admin.js');
// global.ODI.service = require(CORE_PATH + 'modules/service.js');
global.ODI.buttons = require(CORE_PATH + 'controllers/buttons.js');
global.ODI.server = require(CORE_PATH + 'controllers/server.js');
global.ODI.jobs = require(CORE_PATH + 'controllers/jobs.js');

// ODI.utils.setConfig({startTime: ODI.utils.logTime('h:m (D/M)')}, false);

/*if(sleepTime < 255){ // TODO mettre le temp de veille dans le fichier de config
	introMsg += ' for ' + sleepTime + 'h';
	console.log(introMsg + '   -.-');
	setTimeout(function(){ // Delay until restart awake
		ODI.hardware.restartOdi();
	}, sleepTime*60*60*1000);
}else{
	console.log(introMsg + '   -.-');
}*/

ODI.leds.activity(mode); // Activity flag 1/2

//new CronJob('*/3 * * * * *', function(){
//	ODI.leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Activity flag 2/2
//}, null, 0, 'Europe/Paris');

ODI.server.startUI(mode);

ODI.jobs.setBackgroundJobs();

new CronJob('0 * * * * *', function(){
	if(ODI.time.isAlarm()){
		console.log('Alarm... wake up !!');
		ODI.hardware.restartOdi();
	}
}, null, true, 'Europe/Paris');

ok.watch(function(err, value){ // Green button watch for restart awake
	console.log('Ok button pressed, canceling sleep mode & restarting Odi !');
	ODI.hardware.restartOdi();
});

ODI.video.screenOff();
