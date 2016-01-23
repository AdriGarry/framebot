#!/usr/bin/env node

var cpLog = 0;
console.log('>> Starting Odi pgm...');

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var _gpioPins = require('./lib/gpioPins.js');
var gpioPins = new _gpioPins();
var _utils = require('./lib/utils.js');
var utils = new _utils();
var _buttons = require('./lib/buttons.js');
var buttons = new _buttons();
var _leds = require('./lib/leds.js');
var leds = new _leds();
var _clock = require('./lib/clock.js');
var clock = new _clock();
var _tts = require('./lib/tts.js');
var tts = new _tts();

var http = require('./lib/http.js');
var httpInstance = new http();

var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/startupOdi.sh']);
leds.blinkLed(100, 300);
leds.blinkEye(100, 300);
setTimeout(function(){
	leds.clearLeds();
	led.write(1);
	eye.write(0);
}, 500);
setInterval(function(){
	led.write(1);
}, 1000);
setInterval(function(){
	leds.blinkEye(100, 0.5);
}, 60*1000);

clock.startClock();
clock.setAlarms();

setInterval(function(){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			utils.whatsup();
		} else {
			console.error('No network, can\'t check messages & export log  /!\\');
		}
	});
}, 20*1000); //10

//var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'r2d2']);