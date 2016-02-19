#!/usr/bin/env node
// Module Timer

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var leds = require('./leds.js');
var tts = require('./tts.js');

var time = 0;
var timer = false;

var setTimer = function(){
	time = time + 60;
	var etat = 1;
	
	var min = Math.floor(time/60);
	var sec = time%60;
	var ttsMsg = 'Minuterie : ' + ((min>0)? ((min>1)? min : ' une ') + ' minutes ' : '') + ((sec>0)? sec + ' secondes' : '');
	console.log(ttsMsg);
	tts.speak('fr', ttsMsg);
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
		if(time%120 == 0){
			// tts.speak('fr', 'Minuterie ' + time/60 + ' minutes');
			tts.speak('fr', time/60 + ' minutes et compte a rebours');
		}else if(time <= 0){
			clearInterval(sec);
			console.log('End Timer !');
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh', 'end']);
			leds.blinkAllLeds(100, 2.2);
			timer = false;
//			belly.write(0);
		}
	}, 1000);
	}
}
exports.setTimer = setTimer;
