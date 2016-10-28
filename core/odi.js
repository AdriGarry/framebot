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
// ODI's Core version...

var Gpio = require('onoff').Gpio;
var gpioPins = require('./modules/gpioPins.js');
var leds = require('./modules/leds.js');

//leds.blink({leds: ['nose'], speed: 300, loop: 3}); // Start led sequence
leds.activity(); // Initialisation du temoin d'activite 1/2

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

// leds.allLedsOn();

var tts = require('./modules/tts.js');
var buttons = require('./modules/buttons.js');
// leds.allLedsOff();
var CronJob = require('cron').CronJob;
var jobs = require('./modules/jobs.js');
var utils = require('./modules/utils.js');
var service = require('./modules/service.js');
var voiceMail = require('./modules/voiceMail.js');
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

tts.clearLastTTS(); // A REMONTER PLUS HAUT

// new CronJob('*/10 * * * * *', function(){ // Initialisation synchronisation remote
// 	// remote.synchro();//mode
// 	remote.trySynchro();
// }, null, 0, 'Europe/Paris');

setTimeout(function(){
	voiceMail.checkVoiceMail();
}, 6000);

voiceMail.voiceMailFlag(); // A initialiser dans checkVoiceMail()


// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//

var ttsTmp = {lg: "fr", voice: "espeak", msg: "test voicemail"};
/*utils.appendJsonFile('/home/pi/odi/tmp/voicemail.json', ttsTmp, function(callback){
	console.log(callback);
});*/

/*tts.speak({voice: 'espeak', msg:'hey !'});
tts.speak({voice: 'google', msg:'salut'});
tts.speak({voice: 'espeak', msg:'comment tu vas en cette belle journee?'});
tts.speak({voice: 'google', msg:'sa va, et toi ?'});
tts.speak({voice: 'espeak', msg:'bien'});
tts.speak({voice: 'espeak', msg:'oui, je dirais meme que je vais bien !!'});
tts.speak({voice: 'google', msg:'cool'});
tts.speak({});*/
// console.log(service.sayOdiAge());
// service.time();
// tts.speak({msg: 'RANDOM'});

setTimeout(function(){
	// tts.speak({voice: 'espeak', msg: 'Il pleut dehors'});
	// service.time();
}, 5000);

new CronJob('*/4 * * * * *', function(){
	leds.blink({
		leds: ['belly','eye', 'satellite', 'nose'],
		speed: 90,//Math.random() * (200 - 30) + 30,
		loop: 5
	});
}, null, 0, 'Europe/Paris'); // Switch true/false !

