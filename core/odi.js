#!/usr/bin/env node
'use strict'

var mode = process.argv[2]; // Get parameters
console.log('Odi\'s context initializing...');

var spawn = require('child_process').spawn;
var fs = require('fs');
var exec = require('child_process').exec;
var util = require('util');
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
// global.log = function(o){console.log('LLOOGG', o)}
if(CONFIG.debug) require(CORE_PATH + 'modules/debug.js');
else console.debug = function(){};
// if(CONFIG.debug) console.debug = function(o){console.log(o);} else console.debug = function(o){};
// if(CONFIG.debug){
// 	console.debug = function(){
// 		var log = '\u2022';
// 		for(var arg=0;arg<arguments.length;++arg){
// 			if(typeof arguments[arg] == 'object'){
// 				log = log + ' ' + util.format(util.inspect(arguments[arg]));
// 			}else{
// 				log = log + ' ' + arguments[arg];
// 			}
// 		}
// 		console.log(log);
// 	}
// }else console.debug = function(o){};

/** If debug mode, set a timer to cancel in 30 min */
// if(CONFIG.debug){
// 	//TODO screen on & tail odi.log !
// 	var debugTimeout = 30*60*1000;
// 	// TODO launch timeout watcher
// 	console.debug('Timeout to cancel Debug mode:',debugTimeout);
// 	setTimeout(function(){
// 		console.debug('>> CANCELING DEBUG MODE... & Restart !!');
// 		ODI.utils.setConfig({debug: !CONFIG.debug}, true);
// 	}, debugTimeout);
// }


spawn('sh', [CORE_PATH + 'sh/init.sh']);
spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

global.ODI = {};
global.ODI.leds = require(CORE_PATH + 'modules/leds.js');
ODI.leds.toggle({led:'eye', mode: 1});
global.ODI.utils = require(CORE_PATH + 'modules/utils.js');
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
global.ODI.service = require(CORE_PATH + 'modules/service.js');
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

var etat = ODI.buttons.getEtat();
console.debug('ODI.buttons.etat:', etat);
ODI.jobs.startClock(etat); // Starting speaking clock

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
	new CronJob('2 * * * * *', function(){
		ODI.time.isAlarm()
	}, null, true, 'Europe/Paris');
}

ODI.jobs.setInteractiveJobs();
ODI.jobs.setAutoSleep();
ODI.jobs.setBackgroundJobs();
ODI.voiceMail.voiceMailFlag();
ODI.leds.toggle({led:'eye', mode: 0});

if(etat == 1){
	ODI.video.startCycle();
}else{
	// ODI.video.screenOff();
}

// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//

// var constants = os.constants;
console.log('os.constants', os.constants);
//!:
var boolean = true;
setInterval(function(){
	// var loads = os.loadavg();
	// console.log('loads', loads);
	// var cpu = os.cpus()
	// console.log('cpu', cpu);
	// LogAction(boolean?toto:'toto');
	// !boolean;

	// ODI.service.randomAction();
}, 10000);

// spawn('sh', ['/home/pi/odi/core/sh/diapo.sh']);

/*setTimeout(function(){
	console.log('ODI.leds.altLeds()');
	ODI.leds.altLeds(50, 5);
}, 2000);*/

// execCmd('ls /home/pi/odi/');
// find /home/pi/odi/ -exec stat \{} --printf="%y\n" \; | sort -n -r | head -n 1
// ODI.utils.execCmd('find /home/pi/odi/ -exec stat \\\{} --printf="%y\\\n" \\\; | sort -n -r | head -n 1');
// ODI.utils.execCmd('find /home/pi/odi/ -printf "%T+\n" | sort -nr | head -n 1');


ODI.utils.execCmd('df -h', function(data){
	//console.log('df -h:', data);
});


function OdiError(message){
	this.name = 'OdiError';
	this.message = message || 'OdiError default message';
	this.stack = (new Error()).stack;
}
OdiError.prototype = Object.create(Error.prototype);
OdiError.prototype.constructor = OdiError;

try{
	// throw new OdiError();
}catch(e){
	console.log(e);
	// console.log(e.name);
	// console.log(e.message);
	// console.log(e.stack);
}
// console.error({a:'AAA', b: 'BBB'});
// console.error(new OdiError('toto'));

/*function MonErreur(message) {
  this.name = 'MonErreur';
  this.message = message || 'Message par défaut';
  this.stack = (new Error()).stack;
}
MonErreur.prototype = Object.create(Error.prototype);
MonErreur.prototype.constructor = MonErreur;

try {
  throw new MonErreur();
} catch (e) {
  console.log(e.name);     // 'MonErreur'
  console.log(e.message);  // 'Message par défaut'
}*/