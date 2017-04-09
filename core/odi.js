#!/usr/bin/env node
'use strict'

var mode = process.argv[2]; // Get parameters
// console.log('>> Odi Core start sequence...',(mode ? '[mode:' + mode + ']' : ''));
// console.log('>> Odi Core context initialization...');
console.log('Odi\'s context initializing...');

var spawn = require('child_process').spawn;
var fs = require('fs');
var exec = require('child_process').exec;
var os = require('os');
var Gpio = require('onoff').Gpio;
var CronJob = require('cron').CronJob;

/** Odi's global context */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.TMP_PATH = '/home/pi/odi/tmp/';
global.CONFIG = require(CONFIG_FILE);

/** Debug Mode */
if(CONFIG.debug) console.debug = function(o){console.log('\u2022 ' + o);}
else console.debug = function(o){};
console.debug('-> ->  DEBUG MODE !!');

spawn('sh', [CORE_PATH + 'sh/init.sh']);
spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

global.ODI = {};
global.ODI.gpioPins = require(CORE_PATH + 'modules/gpioPins.js');
global.ODI.leds = require(CORE_PATH + 'modules/leds.js');
ODI.leds.toggle({led:'eye', mode: 1});
global.ODI.utils = require(CORE_PATH + 'modules/utils.js');
global.ODI.CronJob = require('cron').CronJob;
global.ODI.time = require(CORE_PATH + 'modules/time.js');
global.ODI.voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
global.ODI.video = require(CORE_PATH + 'modules/video.js');
global.ODI.service = require(CORE_PATH + 'modules/service.js');
global.ODI.tts = require(CORE_PATH + 'modules/tts.js');
global.ODI.hardware = require(CORE_PATH + 'modules/hardware.js');
global.ODI.jukebox = require(CORE_PATH + 'modules/jukebox.js');
global.ODI.exclamation = require(CORE_PATH + 'modules/exclamation.js');
global.ODI.fip = require(CORE_PATH + 'modules/fip.js');
global.ODI.party = require(CORE_PATH + 'modules/party.js');
global.ODI.video = require(CORE_PATH + 'modules/video.js');
global.ODI.party = require(CORE_PATH + 'modules/party.js');
global.ODI.admin = require(CORE_PATH + 'modules/admin.js');
global.ODI.buttons = require(CORE_PATH + 'controllers/buttons.js');
global.ODI.server = require(CORE_PATH + 'controllers/server.js');
global.ODI.jobs = require(CORE_PATH + 'controllers/jobs.js');
// console.log('Context loaded');

// ODI.utils.setConfig({startTime: ODI.utils.logTime('h:m (D/M)')}, false);

ODI.leds.activity(); // Activity flag 1/2

ODI.server.startUI(mode);

new CronJob('*/3 * * * * *', function(){
	ODI.leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Activity flag 2/2
}, null, 0, 'Europe/Paris');

ODI.buttons.initButtonAwake();

ODI.jobs.startClock(ODI.buttons.getEtat()); // Starting speaking clock

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

if(!ODI.time.isAlarm()){// ALARMS
	ODI.voiceMail.checkVoiceMail();
	new CronJob('5 * * * * *', function(){
		ODI.time.isAlarm()
	}, null, true, 'Europe/Paris');
}

ODI.jobs.setInteractiveJobs();
ODI.jobs.setAutoSleep();
ODI.jobs.setBackgroundJobs();
ODI.voiceMail.voiceMailFlag();
ODI.leds.toggle({led:'eye', mode: 0});

if(ODI.buttons.getEtat() == 1){
	ODI.video.startCycle(); // TODO A ne lancer que si bouton up
}

/** If debug mode, set a timer to cancel in 20 min */
if(CONFIG.debug){
	console.debug('Setting up time out to cancel Debug mode !!');
	setTimeout(function(){
		console.debug('>> CANCELING DEBUG MODE... & Restart !!');
		ODI.utils.setConfig({debug: !CONFIG.debug}, true);
	}, 10*60*1000);
}

// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//

// var constants = os.constants;
console.log('os.constants', os.constants);
//!:
setInterval(function(){
	var loads = os.loadavg();
	// console.log('loads', loads);
	var cpu = os.cpus()
	// console.log('cpu', cpu);
}, 2000);
// spawn('sh', ['/home/pi/odi/core/sh/diapo.sh']);

/*setInterval(function(){
	var etat = ODI.buttons.getEtat();
	if(etat){
		console.log('tts.js TEST');
		ODI.tts.randomConversation();
	}
}, 3*60*1000);*/
