#!/usr/bin/env node
'use strict'

/** Odi's global variables  */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.TMP_PATH = '/home/pi/odi/tmp/';

/** Setting up Odi's config */
global.CONFIG = require(CONFIG_FILE);

/** Debug Mode */
if(CONFIG.debug) console.debug = console.log;
else console.debug = function(o){};

var mode = process.argv[2]; // Recuperation des arguments
console.log('>> Odi Core started',(mode ? '[mode:' + mode + ']' : ''));
console.debug('-> ->  DEBUG MODE !!');//'\n---------------------\n', 

console.log('CONFIG', CONFIG);

var Gpio = require('onoff').Gpio;
var gpioPins = require(CORE_PATH + 'modules/gpioPins.js');
var leds = require(CORE_PATH + 'modules/leds.js');

//leds.blink({leds: ['nose'], speed: 300, loop: 3}); // Start led sequence
leds.activity(); // Initialisation du temoin d'activite 1/2

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'odi', 'noLeds']);

// leds.allLedsOn();

var utils = require(CORE_PATH + 'modules/utils.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var buttons = require(CORE_PATH + 'controllers/buttons.js');
var server = require(CORE_PATH + 'controllers/server.js');
var jobs = require(CORE_PATH + 'controllers/jobs.js');
// leds.allLedsOff();
var CronJob = require('cron').CronJob;

var service = require(CORE_PATH + 'modules/service.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');

// LED Start sequence
//leds.blinkLed(100, 300); // Sequence led de start

new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Initialisation du temoin d'activite 2/2
}, null, 0, 'Europe/Paris');

server.startUI(mode);
buttons.initButtonAwake();

jobs.startClock(buttons.getEtat()); // Starting speaking clock

jobs.setAlarms(); // Initialisation des alarmes
jobs.setAutoLifeCycle(); // Initialisation du rythme de vie j/n
jobs.setBackgroundJobs(); // Demarrage des taches de fond


// new CronJob('*/10 * * * * *', function(){ // Initialisation synchronisation remote
// 	// remote.synchro();//mode
// 	remote.trySynchro();
// }, null, 0, 'Europe/Paris');

setTimeout(function(){
	voiceMail.checkVoiceMail();
}, 5000);

voiceMail.voiceMailFlag(); // A initialiser dans checkVoiceMail()

/** If debug mode, set a timer to cancel in 20 min */
if(CONFIG.debug){
	console.debug('Setting up time out to cancel Debug mode !!');
	setTimeout(function(){
		console.debug('Canceling debug mode... & Restart !!');
		utils.setConfig('debug', null, true);
	}, 10*60*1000);
}


// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//

//tts.speak([{voice: 'google', lg: 'fr', msg:'un'}, {voice: 'espeak', lg: 'fr', msg:'deux'}, {voice: 'google', lg: 'fr', msg:'trois'}]);

/*tts.speak({voice: 'espeak', msg:'hey !'});
tts.speak({voice: 'google', msg:'salut'});
tts.speak({voice: 'espeak', msg:'comment tu vas en cette belle journee?'});
tts.speak({voice: 'google', msg:'sa va, et toi ?'});
tts.speak({voice: 'espeak', msg:'bien'});
tts.speak({voice: 'espeak', msg:'oui, je dirais meme que je vais bien !!'});
tts.speak({voice: 'google', msg:'cool'});*/
// console.log(service.sayOdiAge());
// service.timeNow();
// tts.speak({msg: 'RANDOM'});

setTimeout(function(){
	//tts.speak({voice: 'espeak', msg: 'Et oui, sait moi Odi, je suis de retour !'});
}, 5*60*1000);

setTimeout(function(){
	//service.adriExclamation();
}, 7*60*1000);

new CronJob('*/4 * * * * *', function(){
	leds.blink({
		leds: ['belly','eye', 'satellite', 'nose'],
		speed: 90,//Math.random() * (200 - 30) + 30,
		loop: 5
	});
}, null, 0, 'Europe/Paris'); // Switch true/false !

