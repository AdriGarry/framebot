#!/usr/bin/env node

var minToWakeUp = 180;
console.log('>> Starting Odi pgm...  [sleep mode for ' + minToWakeUp + ' min ]');

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var gpioPins = require('./lib/gpioPins.js');
var utils = require('./lib/utils.js');
// var buttons = require('./lib/buttons.js');
var leds = require('./lib/leds.js');
// var clock = require('./lib/clock.js');
// var tts = require('./lib/tts.js');
var remote = require('./lib/remote.js');

// leds.blinkLed(100, 300);
var mode = process.argv[2];
console.log('mode : ' + mode);
setInterval(function(){
	led.write(1);
}, 5000);
// setInterval(function(){
	// leds.blinkSatellite(500,1.15);
	// leds.blinkBelly(500,1.15);
// }, 3000);

ok.watch(function(err, value){
	utils.restartOdi();
});

setInterval(function(){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			remote.check();
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, 13*1000);

setTimeout(function(){
	utils.restartOdi();
}, minToWakeUp*60*1000);
