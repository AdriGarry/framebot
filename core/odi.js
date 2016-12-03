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
global.CONFIG = require(CONFIG_FILE);
/*var fs = require('fs');
global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));*/

/** Debug Mode */
if(CONFIG.debug) console.debug = console.log;
else console.debug = function(o){};

var mode = process.argv[2]; // Get parameters
console.log('>> Odi Core start sequence...',(mode ? '[mode:' + mode + ']' : ''));
console.debug('-> ->  DEBUG MODE !!');//'\n---------------------\n', 

var utils = require(CORE_PATH + 'modules/utils.js');
utils.setConfig('startTime', new Date().getHours()+':'+new Date().getMinutes(), false);

// console.log('Start sequence...');
var Gpio = require('onoff').Gpio;
var gpioPins = require(CORE_PATH + 'modules/gpioPins.js');
var leds = require(CORE_PATH + 'modules/leds.js');

//leds.blink({leds: ['nose'], speed: 300, loop: 3}); // Start led sequence
leds.activity(); // Initialisation du temoin d'activite 1/2

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

// leds.allLedsOn();
// leds.allLedsOff();
var CronJob = require('cron').CronJob;
new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Initialisation du temoin d'activite 2/2
}, null, 0, 'Europe/Paris');

// LED Start sequence
//leds.blinkLed(100, 300); // Sequence led de start

var server = require(CORE_PATH + 'controllers/server.js');
server.startUI(mode);

var buttons = require(CORE_PATH + 'controllers/buttons.js');
buttons.initButtonAwake();

var jobs = require(CORE_PATH + 'controllers/jobs.js');
jobs.startClock(buttons.getEtat()); // Starting speaking clock

//var service = require(CORE_PATH + 'modules/service.js');
var time = require(CORE_PATH + 'modules/time.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
// ALARMS
if(time.isAlarm()){
	time.cocorico('slow');
}else{
	voiceMail.checkVoiceMail();
	new CronJob('5 * * * * *', function(){ // A DEPLACER AILLEURS ???
		if(time.isAlarm()){
			time.cocorico('slow');
		}
	}, null, true, 'Europe/Paris');
}

jobs.setJobs(); // Initialisation des alarmes
jobs.setAutoLifeCycle(); // Initialisation du rythme de vie j/n
jobs.setBackgroundJobs(); // Demarrage des taches de fond
voiceMail.voiceMailFlag();

/** If debug mode, set a timer to cancel in 20 min */
if(CONFIG.debug){
console.debug('Setting up time out to cancel Debug mode !!');
setTimeout(function(){
	console.debug('>> Canceling debug mode... & Restart !!');
	utils.setConfig('debug', null, true);
}, 10*60*1000);
}

// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//
var tts = require(CORE_PATH + 'modules/tts.js');
//tts.speak([{voice: 'google', lg: 'fr', msg:'un'}, {voice: 'espeak', lg: 'fr', msg:'deux'}, {voice: 'google', lg: 'fr', msg:'trois'}]);

//spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'tone']);

setTimeout(function(){
	// tts.speak({voice: 'espeak', msg: 'Et oui, sait moi Odi, je suis de retour !'});
}, 5*60*1000);

setTimeout(function(){
	/*utils.setConfig('alarms', {
		weekDay: {h:7, m:10, d: [1,2,3,4,5]},
		weekEnd: {"h":11, m :59, d: [0,6]},
		custom: {h:1, m:1, d: [0,1,2,3,4,5,6]}
	}, false);*/
}, 20*1000);
