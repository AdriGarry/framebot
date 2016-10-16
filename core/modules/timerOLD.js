#!/usr/bin/env node

// Module Timer

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var leds = require('./leds.js');
var tts = require('./tts.js');

var time = 0;
var timer = false;

/** Fonction minuterie */
var setTimer = function(minutes){
	if(typeof minutes !== undefined && minutes > 1){
		minutes = 60 * minutes;
	}else{
		minutes = 60;
	}
	console.log(minutes);
	time = time + minutes;
	var etat = 1;
	
	var min = Math.floor(time/60);
	var sec = time%60;
	var ttsMsg = 'Minuterie ' + ((min>0)? ((min>1)? min : ' une ') + ' minutes ' : '') + ((sec>0)? sec + ' secondes' : '');
	console.log(ttsMsg);
	// tts.speak('fr', ttsMsg);
	tts.new({lg:'fr', msg:ttsMsg});
	if(!timer){
	timer = true;
	var sec = setInterval(function(){
		belly.write(etat);
		etat = 1 - etat;
		if(time < 10){
			var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh', 'almost']);
		}
		else{
			var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh']);
		}
		time--;
		if(time%120 == 0 && (time/60)>0){
			// tts.speak('fr', time/60 + ' minutes et compte a rebours');
			tts.new({lg:'fr', msg:time/60 + ' minutes et compte a rebours'});
		}else if(time <= 0){
			clearInterval(sec);
			console.log('End Timer !');
			var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh', 'end']);
			leds.blink({leds: ['belly','eye', 'satellite', 'nose'], speed: 90, loop: 12});
			// tts.speak('fr', 'Les raviolis sont cuits !');
			tts.new({lg:'fr', msg:'Les raviolis sont cuits !'});
			timer = false;
			belly.write(0);
		}
	}, 1000);
	}
}
exports.setTimer = setTimer;

/** Function to return minutes left on timer **/
exports.timeLeftTimer = function timeLeftTimer(){
	console.log('timeLeft()');
	console.log(time);
	return time;
};

/** Function to stop timer **/
exports.stopTimer = function stopTimer(){
	console.log(time);
	time = 0;
	//return time;
};
