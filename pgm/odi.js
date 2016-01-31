#!/usr/bin/env node

var cpLog = 0;
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

leds.blinkLed(100, 300);
leds.blinkEye(100, 300);
var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/startupOdi.sh']);
setTimeout(function(){
	leds.clearLeds();
	led.write(1);
	eye.write(0);
}, 500);
setInterval(function(){
	led.write(1);
}, 1000);
/*setInterval(function(){
	leds.blinkEye(100, 0.5);
}, 60*1000);*/

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
			utils.whatsup();
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, 10*1000);

service.info();
// setInterval(function(){
	// buttons.getMode(function(modeValue){
		// if(modeValue){
			// utils.testConnexion(function(connexion){
				// if(connexion == true){
					// service.weather();
				// } else {
					// console.error('No network, can\'t get weather info  /!\\');
				// }
			// });
		// }else{
			// service.date();
		// }
	// });	
// }, 20*1000);

//var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'r2d2']);