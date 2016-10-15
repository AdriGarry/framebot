#!/usr/bin/env node

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var gpioPins = require('./lib/gpioPins.js');
var CronJob = require('cron').CronJob;
var jobs = require('./lib/jobs.js');
var utils = require('./lib/utils.js');
var leds = require('./lib/leds.js');
var _server = require('./lib/server.js');

var mode = sleepTime = process.argv[2]; // Recuperation des arguments

var introMsg = 'Odi\'s sleeping...';

if(sleepTime < 255){
	introMsg += ' for ' + sleepTime + 'h';
	console.log(introMsg + '   -.-');
	setTimeout(function(){ // Delai avant redemarrage/reveil
		utils.restartOdi();
	}, sleepTime*60*60*1000);
}else{
	console.log(introMsg + '   -.-');
	jobs.setAutoLifeCycle('S'); // Si pas de delai alors auto reveil en fonction du jour
}

leds.activity(mode); // Initialisation du temoin d'activite 1/2

new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Initialisation du temoin d'activite 2/2
}, null, 0, 'Europe/Paris');


_server.startUI(mode);

jobs.setBackgroundJobs(); // Demarrage des taches de fond

ok.watch(function(err, value){ // Detection bouton Vert pour sortir du mode veille
	console.log('Ok button pressed, canceling sleep mode & restarting Odi !');
	utils.restartOdi();
});

new CronJob('*/15 * * * * *', function(){ // Initialisation synchronisation remote
	remote.trySynchro('sleep');
}, null, 0, 'Europe/Paris');
