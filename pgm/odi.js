#!/usr/bin/env node
'use strict'

var mode = process.argv[2]; // Recuperation des arguments
console.log('>> Odi started in normal mode [' + mode + ']');

var Gpio = require('onoff').Gpio;
var gpioPins = require('./lib/gpioPins.js');
var leds = require('./lib/leds.js');

//leds.blink({leds: ['nose'], speed: 300, loop: 3}); // Start led sequence
leds.activity(); // Initialisation du temoin d'activite 1/2

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'odi', 'noLeds']);

// leds.allLedsOn();

var buttons = require('./lib/buttons.js');
// leds.allLedsOff();
var CronJob = require('cron').CronJob;
var jobs = require('./lib/jobs.js');
var utils = require('./lib/utils.js');
var service = require('./lib/service.js');
var voiceMail = require('./lib/voiceMail.js');
var tts = require('./lib/tts.js');
var _server = require('./lib/server.js');

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

console.log(utils.getOdiAge() / 365);

// jobs.setupJobs();

setTimeout(function(){
	// tts.speak('fr', 'Leonard le cafard, ou es tu ?:1');
	// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', '13Heures']);
}, 2000);

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

// var player = require('player');
/*var fs = require('fs');
fs.readdir('/home/pi/odi/mp3/exclamation', function(err, files){
	if(err) return;
	files.forEach(function(f) {
		console.log('Files: ' + f);
	});
});*/
