#!/usr/bin/env node

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var CronJob = require('cron').CronJob;
var gpioPins = require('./lib/gpioPins.js');
var utils = require('./lib/utils.js');
var leds = require('./lib/leds.js');
var remote = require('./lib/remote.js');

var mode = process.argv[2];
var sleepTime = process.argv[2];

var msg = 'Odi is in sleeping mode...';
 // if(typeof mode === 'number' && mode > 0){
if(/\d/.test(mode)){
	sleepTime = parseInt(sleepTime.replace(/[^\d.]/g, ''), 10);
	if(sleepTime > 0){
		msg = msg + '  for ' + sleepTime + ' hours';
		setTimeout(function(){
			utils.restartOdi();
		}, sleepTime*60*60*1000);
		new CronJob('*/3 * * * * *', function(){
			leds.blinkLed(300, 1.5);
		}, null, true, 'Europe/Paris');
	}else{
		console.log('Rien !_!');
	}
}else{
	new CronJob('*/3 * * * * *', function(){
		leds.blinkLed(300, 0.7);
	}, null, true, 'Europe/Paris');
}
console.log(msg + '   -.-');

ok.watch(function(err, value){
	console.log('Restarting Odi from SLEEP');
	utils.restartOdi();
});

leds.activity(mode);

new CronJob('*/15 * * * * *', function(){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			// remote.check(mode);
			remote.check('sleep');
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, null, true, 'Europe/Paris');