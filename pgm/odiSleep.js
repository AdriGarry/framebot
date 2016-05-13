#!/usr/bin/env node

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var CronJob = require('cron').CronJob;
var gpioPins = require('./lib/gpioPins.js');
var utils = require('./lib/utils.js');
var leds = require('./lib/leds.js');
var remote = require('./lib/remote.js');

var mode = process.argv[2];

var minToWakeUp = 180;
var msg = 'Odi is in sleeping mode...';
if(mode == 'sleepWakeUp'){
	msg = msg + '  for ' + minToWakeUp/60 + ' hours';
	setTimeout(function(){
		utils.restartOdi();
	}, minToWakeUp*60*1000);
	new CronJob('*/3 * * * * *', function(){
		leds.blinkLed(300, 1.5);
	}, null, true, 'Europe/Paris');
}else{
	new CronJob('*/3 * * * * *', function(){
		leds.blinkLed(300, 0.7);
	}, null, true, 'Europe/Paris');
}
console.log(msg + '   -.-');

ok.watch(function(err, value){
	utils.restartOdi();
});

leds.activity(mode);

new CronJob('*/15 * * * * *', function(){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			remote.check(mode);
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, null, true, 'Europe/Paris');