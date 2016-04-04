#!/usr/bin/env node

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
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
	setInterval(function(){
		leds.blinkLed(300, 1.5);
	}, 4000);
}else{
	setInterval(function(){
		leds.blinkLed(300, 0.7);
	}, 4000);
}
console.log(msg + '   -.-');

ok.watch(function(err, value){
	utils.restartOdi();
});
leds.activity(mode);
setInterval(function(){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			remote.check(mode);
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, 15*1000);
