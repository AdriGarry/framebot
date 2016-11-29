#!/usr/bin/env node

/** Odi's global variables & config */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';
global.CONFIG = require(CONFIG_FILE);

/** Debug Mode */
if(CONFIG.debug) console.debug = console.log;
else console.debug = function(){};
console.debug('\n---------------------\n', '-> ->  DEBUG MODE !!');

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var hardware = require('./modules/hardware.js');
var gpioPins = require('./modules/gpioPins.js');
var CronJob = require('cron').CronJob;
// var utils = require('./modules/utils.js');
var utils = require(CORE_PATH + 'modules/utils.js');

var leds = require('./modules/leds.js');
var server = require('./controllers/server.js');
var jobs = require('./controllers/jobs.js');

var mode = sleepTime = process.argv[2]; // Recuperation des arguments

var introMsg = 'Odi\'s sleeping...';

if(sleepTime < 255){
	introMsg += ' for ' + sleepTime + 'h';
	console.log(introMsg + '   -.-');
	setTimeout(function(){ // Delai avant redemarrage/reveil
		hardware.restartOdi();
	}, sleepTime*60*60*1000);
}else{
	console.log(introMsg + '   -.-');
	jobs.setAutoLifeCycle('S'); // Si pas de delai alors auto reveil en fonction du jour
}

console.log('global.CONFIG', global.CONFIG);

leds.activity(mode); // Initialisation du temoin d'activite 1/2

new CronJob('*/3 * * * * *', function(){
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Initialisation du temoin d'activite 2/2
}, null, 0, 'Europe/Paris');

server.startUI(mode);

jobs.setBackgroundJobs(); // Demarrage des taches de fond

ok.watch(function(err, value){ // Detection bouton Vert pour sortir du mode veille
	console.log('Ok button pressed, canceling sleep mode & restarting Odi !');
	hardware.restartOdi();
});

new CronJob('0 * * * * *', function(){
	if(utils.isAlarm()){
		console.log('Alarm... wake up !!');
		hardware.restartOdi();
	}
}, null, true, 'Europe/Paris');
