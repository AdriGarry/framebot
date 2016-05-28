#!/usr/bin/env node

console.log('>> Odi started in normal mode...   :)');

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var gpioPins = require('./lib/gpioPins.js');
var buttons = require('./lib/buttons.js');
var CronJob = require('cron').CronJob;
var jobs = require('./lib/jobs.js');
var utils = require('./lib/utils.js');
var remote = require('./lib/remote.js');
var leds = require('./lib/leds.js');
var service = require('./lib/service.js');
// var voiceMail = require('./lib/voiceMail.js');
var tts = require('./lib/tts.js');
var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'odi']);

leds.blinkLed(100, 300); // Sequence led de start
var mode = process.argv[2]; // Recuperation des arguments

setTimeout(function(){
	leds.clearLeds();
	led.write(1);
	eye.write(0);
}, 500);

leds.activity(); // Initialisation du temoin d'activite 1/2
setInterval(function(){
	leds.blinkLed(400, 0.7);
}, 3000);

new CronJob('*/3 * * * * *', function(){
	leds.blinkLed(300, 1); // Initialisation du temoin d'activite 2/2
}, null, true, 'Europe/Paris');

jobs.setBackgroundJobs(); // Demarrage des taches de fond

buttons.getEtat(function(modeValue){ // Demarrage de l'horloge
	if(modeValue){
		jobs.startClock(true);
	}else{
		jobs.startClock(false);
	}
});

jobs.setAlarms(); // Initialisation des alarmes

new CronJob('*/10 * * * * *', function(){ // Initialisation synchronisation remote
	// remote.synchro();//mode
	remote.trySynchro();
}, null, true, 'Europe/Paris');

// ----- TEST SECTION -----//
new CronJob('13 * * * * *', function(){
	tts.conversation('random');
}, null, false, 'Europe/Paris'); // Switch true/false !

