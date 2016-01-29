#!/usr/bin/env node
// Module Timer

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var led = require('./led.js');
var tts = require('./tts.js');

var time = 0;
var timer = false;

var setTimer = function(){
	time = time + 60;
	var etat = 1;
	console.log('Seconds remaining = ' + time);
	tts.speak('fr','Minuterie :' + time + ' secondes');
	if(!timer){
	timer = true;
	var sec = setInterval(function(){
		belly.write(etat);
		etat = 1 - etat;
		if(time < 10){
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh', 'almost']);
		}
		else{
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh']);
		}
		time--;
		if(time <= 0){
			clearInterval(sec);
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh', 'end']);
			led.blinkAllLeds(100, 2.2);
			timer = false;
//			belly.write(0);
		}
	}, 1000);
	}
}
exports.setTimer = setTimer;
