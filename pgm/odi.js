#!/usr/bin/env node

console.log('>> Odi is in normal mode...   :)');

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var gpioPins = require('./lib/gpioPins.js');
var utils = require('./lib/utils.js');
var buttons = require('./lib/buttons.js');
var leds = require('./lib/leds.js');
var clock = require('./lib/clock.js');
var tts = require('./lib/tts.js');
var remote = require('./lib/remote.js');
var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'odi']);

leds.blinkLed(100, 300);
var mode = process.argv[2];

setTimeout(function(){
	leds.clearLeds();
	led.write(1);
	eye.write(0);
}, 500);

leds.activity();
setInterval(function(){
	leds.blinkLed(300, 1);
}, 3000);

buttons.getEtat(function(modeValue){
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
}, 10*1000);

remote.checkVoiceMail();