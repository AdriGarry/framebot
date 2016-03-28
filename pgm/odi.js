#!/usr/bin/env node

console.log('>> Starting Odi pgm...');

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var gpioPins = require('./lib/gpioPins.js');
var utils = require('./lib/utils.js');
// var buttons = require('./lib/buttons.js');
var leds = require('./lib/leds.js');
// var clock = require('./lib/clock.js');
// var tts = require('./lib/tts.js');
var remote = require('./lib/remote.js');

leds.blinkLed(100, 300);
var mode = process.argv[2];
console.log('mode : ' + mode);
console.log('TEST');
// /////////////////// =======> Separer en plusieurs focntions !!!!!!!!!!!!
if(mode == 'sleep'){
	ok.watch(function(err, value){
		utils.restartOdi();
	});
	setInterval(function(){
		leds.blinkLed(300, 1);
	}, 5000);
	setInterval(function(){
		utils.testConnexion(function(connexion){
			if(connexion == true){
				remote.check();
			} else {
				console.error('No network, can\'t check messages & export log  /!\\');
			}
		});
	}, 13*1000);
}else{
var buttons = require('./lib/buttons.js');
var clock = require('./lib/clock.js');
var tts = require('./lib/tts.js');
	var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'odi']);
	setTimeout(function(){
		leds.clearLeds();
		led.write(1);
		eye.write(0);
	}, 500);
	// setInterval(function(){
		// led.write(1);
	// }, 1000);
	leds.activity();
	setInterval(function(){
		leds.blinkLed(100, 0.5);
	}, 3000);

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
	}, 10*1000);//13
}