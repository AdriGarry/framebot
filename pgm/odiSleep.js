#!/usr/bin/env node

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var gpioPins = require('./lib/gpioPins.js');
var CronJob = require('cron').CronJob;
var jobs = require('./lib/jobs.js');
var utils = require('./lib/utils.js');
var leds = require('./lib/leds.js');
var remote = require('./lib/remote.js');

var mode = sleepTime = process.argv[2]; // Recuperation des arguments

console.log('Odi started in sleeping mode for ' + sleepTime + ' hours   -.-');

leds.activity(mode); // Initialisation du temoin d'activite 1/2

new CronJob('*/3 * * * * *', function(){
	leds.blinkLed(400, 0.7); // Initialisation du temoin d'activite 2/2
}, null, true, 'Europe/Paris');

jobs.setBackgroundJobs(); // Demarrage des taches de fond

ok.watch(function(err, value){ // Detection bouton Vert pour sortir du mode veille
	console.log('Ok button pressed, canceling sleep mode & restarting Odi !');
	utils.restartOdi();
});

new CronJob('*/15 * * * * *', function(){ // Initialisation synchronisation remote
	remote.trySynchro('sleep');
	/*utils.testConnexion(function(connexion){
		if(connexion == true){
			// remote.check(mode);
			remote.synchro('sleep');
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});*/
}, null, true, 'Europe/Paris');

setTimeout(function(){ // Delai avant redemarrage/reveil
	utils.restartOdi();
}, sleepTime*60*60*1000);
