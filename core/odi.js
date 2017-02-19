#!/usr/bin/env node
'use strict'

/** Odi's global variables & config */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.TMP_PATH = '/home/pi/odi/tmp/';

var orders = require(CORE_PATH + 'controllers/orders.js');
var Gpio = require('onoff').Gpio;
var gpioPins = require(CORE_PATH + 'modules/gpioPins.js');
var leds = require(CORE_PATH + 'modules/leds.js');
//leds.allLedsOn();
leds.toggle({led:'eye', mode: 1});

global.CONFIG = require(CONFIG_FILE);
/*var fs = require('fs');
global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));*/

/** Debug Mode */
if(CONFIG.debug) console.debug = function(o){console.log('\u2022 ' + o);}
// if(CONFIG.debug) console.debug = console.log;
else console.debug = function(o){};

var mode = process.argv[2]; // Get parameters
console.log('>> Odi Core start sequence...',(mode ? '[mode:' + mode + ']' : ''));
console.debug('-> ->  DEBUG MODE !!');//'\n---------------------\n', 

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

var utils = require(CORE_PATH + 'modules/utils.js');
// utils.setConfig({mode: 'ready', startTime: new Date().getHours()+':'+new Date().getMinutes()}, false);
utils.setConfig({mode: 'ready', startTime: utils.logTime('h:m (D/M)')}, false);

leds.activity(); // Activity flag 1/2

var server = require(CORE_PATH + 'controllers/server.js');
server.startUI(mode);

var CronJob = require('cron').CronJob;
new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Activity flag 2/2
}, null, 0, 'Europe/Paris');

var buttons = require(CORE_PATH + 'controllers/buttons.js');
buttons.initButtonAwake();

leds.toggle({led:'eye', mode: 0});

var jobs = require(CORE_PATH + 'controllers/jobs.js');
jobs.startClock(buttons.getEtat()); // Starting speaking clock

var time = require(CORE_PATH + 'modules/time.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
// if(time.isAlarm()){// ALARMS
// 	time.cocorico('sea'); // ============> TODO TODO TODO !!!
// }else{
// 	voiceMail.checkVoiceMail();
// 	new CronJob('5 * * * * *', function(){
// 		if(time.isAlarm()){
// 			time.cocorico('sea'); // ============> TODO TODO TODO !!!
// 		}
// 	}, null, true, 'Europe/Paris');
// }


if(!time.isAlarm()){// ALARMS
	voiceMail.checkVoiceMail();
	new CronJob('5 * * * * *', function(){
		time.isAlarm()
	}, null, true, 'Europe/Paris');
}


jobs.setInteractiveJobs();
jobs.setAutoSleep();
jobs.setBackgroundJobs();
voiceMail.voiceMailFlag();

/** If debug mode, set a timer to cancel in 20 min */
if(CONFIG.debug){
	console.debug('Setting up time out to cancel Debug mode !!');
	setTimeout(function(){
		console.debug('>> CANCELING DEBUG MODE... & Restart !!');
		utils.setConfig({debug: !CONFIG.debug}, true);
	}, 10*60*1000);
}

// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//
var tts = require(CORE_PATH + 'modules/tts.js');
//tts.speak([{voice: 'google', lg: 'fr', msg:'un'}, {voice: 'espeak', lg: 'fr', msg:'deux'}, {voice: 'google', lg: 'fr', msg:'trois'}]);

//spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'tone']);

var service = require(CORE_PATH + 'modules/service.js');
setInterval(function(){
	var etat = buttons.getEtat();
	if(etat){
		console.log('tts.js TEST');
		tts.randomConversation();
	}
}, 1*60*1000);
