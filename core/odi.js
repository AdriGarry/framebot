#!/usr/bin/env node
'use strict'

/** Odi's global variables  */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';

var mode = process.argv[2]; // Recuperation des arguments
console.log('>> Odi Core started' + (mode ? ' [mode:' + mode + ']' : ''));

var Gpio = require('onoff').Gpio;
var gpioPins = require('./modules/gpioPins.js');
var leds = require('./modules/leds.js');

//leds.blink({leds: ['nose'], speed: 300, loop: 3}); // Start led sequence
leds.activity(); // Initialisation du temoin d'activite 1/2

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

// leds.allLedsOn();

var buttons = require('./modules/buttons.js');
// leds.allLedsOff();
var CronJob = require('cron').CronJob;
var jobs = require('./modules/jobs.js');
var utils = require('./modules/utils.js');
var service = require('./modules/service.js');
var voiceMail = require('./modules/voiceMail.js');
var tts = require('./modules/tts.js');
var _server = require('./modules/server.js');

// LED Start sequence
//leds.blinkLed(100, 300); // Sequence led de start

new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Initialisation du temoin d'activite 2/2
}, null, 0, 'Europe/Paris');

_server.startUI(mode);
buttons.initButtonAwake();

jobs.startClock(buttons.getEtat()); // Starting speaking clock

jobs.setAlarms(); // Initialisation des alarmes
jobs.setAutoLifeCycle(); // Initialisation du rythme de vie j/n
jobs.setBackgroundJobs(); // Demarrage des taches de fond

new CronJob('*/10 * * * * *', function(){ // Initialisation synchronisation remote
	// remote.synchro();//mode
	remote.trySynchro();
}, null, 0, 'Europe/Paris');


setTimeout(function(){
	voiceMail.checkVoiceMail();
}, 6000);

voiceMail.voiceMailFlag(); // A initialiser dans checkVoiceMail()


// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//

/*for(var i=0;i<10;i++){
	console.log(Math.round(Math.random()*1));
}*/

// console.log(tts);
tts.listenQueue();
tts.new({voice: 'espeak', msg:'hey !'});
tts.new({voice: 'google', msg:'salut'});
tts.new({voice: 'espeak', msg:'comment tu vas en cette belle journee?'});
tts.new({voice: 'google', msg:'sa va, et toi ?'});
tts.new({voice: 'espeak', msg:'bien'});
tts.new({voice: 'espeak', msg:'oui, je dirais meme que je vais bien !!'});
tts.new({voice: 'google', msg:'cool'});
tts.new({});
// console.log(service.sayOdiAge());

// jobs.setupJobs();

setTimeout(function(){
	tts.new({voice: 'espeak', msg: 'Il pleut dehors'});
	// var deploy = spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', '13Heures']);
}, 8000);

new CronJob('*/4 * * * * *', function(){
	leds.blink({
		leds: ['belly','eye', 'satellite', 'nose'],
		speed: 90,//Math.random() * (200 - 30) + 30,
		loop: 5
	});
}, null, 0, 'Europe/Paris'); // Switch true/false !

new CronJob('*/2 * * * * *', function(){
	console.log(utils.getCPUUsage());
}, null, 0, 'Europe/Paris'); // Switch true/false !

