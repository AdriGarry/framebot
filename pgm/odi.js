#!/usr/bin/env node

// var cpLog = 0;
console.log('>> Starting Odi pgm...');

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var gpioPins = require('./lib/gpioPins.js');
var utils = require('./lib/utils.js');
var buttons = require('./lib/buttons.js');
var leds = require('./lib/leds.js');
var clock = require('./lib/clock.js');
var tts = require('./lib/tts.js');
var service = require('./lib/service.js');
var remote = require('./lib/remote.js');

leds.blinkLed(100, 300);
var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'odi']);

setTimeout(function(){
	leds.clearLeds();
	led.write(1);
	eye.write(0);
}, 500);
setInterval(function(){
	led.write(1);
}, 1000);

buttons.getMode(function(modeValue){
	if(modeValue){
		clock.startClock(true);
	}else{
		clock.startClock(false);
	}
});

clock.setAlarms();

setInterval(function(){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			remote.check();
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, 13*1000);
