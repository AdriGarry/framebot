#!/usr/bin/env node
// Module de gestion des boutons

var buttons = function(){

var log = 'Odi/ ';
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var leds = require('./leds.js');
var exclamation = require('./exclamation.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var _jukebox = require('./jukebox.js');
var jukebox = new _jukebox();
var tts = require('./tts.js');
var clock = require('./clock.js');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var utils = require('./utils.js');

var self = this;
var cpBtn = 1;

mode.watch(function(err, value){
	value = mode.readSync();
	console.log(' Mode: ' + value + ' [mode has changed]');
	if(fip.instance){
		fip.stopFip('Rebooting FIP RADIO (volume changed)');
		setTimeout(function(){
			fip.playFip();
		}, 100);
	}
	utils.autoMute();
});

var instance = false;
setInterval(function(){
	var value = mode.readSync();
	satellite.writeSync(value);
	if(1 === value){
		if(!instance){
			instance = true;
			setTimeout(function(){
				var date = new Date();
				var min = date.getMinutes();
				if(min&1){
					exclamation.exclamationRdmDelayLoop();
				} else {
					tts.speakRdmDelayLoop();
				}
			}, 20*1000);
		}
	}
	else{
		instance = false;
	}
}, 1000);

ok.watch(function(err, value){
	leds.ledOn('belly');
	var pressTime = new Date();
	while(ok.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	console.log('[val : ' + value + ']  Ok btn pressed for ' + pressTime + ' sec');
	if(pressTime < 1.5){
		utils.testConnexion(function(connexion){
			var date = new Date();
			var min = date.getMinutes();
			if(min%2 == 0 && connexion == true){
				tts.speak('','');
			}else{
				// event.emit('exclamation2Rappels', 'Exclamation2Rappels');
				exclamation.exclamation2Rappels();
			}
		});
	}else if(pressTime > 2){
		// event.emit('playFip', 'Fip Radio');
		fip.playFip();
	}
	utils.autoMute();
});

cancel.watch(function(err, value){
	utils.mute();
	leds.ledOn('belly');
	// leds.buttonPush();
	var pressTime = new Date();
	while(cancel.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	leds.buttonPush('stop');
	console.log('[val : ' + value + ']  Cancel btn pressed for ' + pressTime + ' sec');
	if(pressTime > 1.5){
		utils.mute();
		console.log('Restarting program...');
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
		deploy = spawn('node', ['/home/pi/odi/pgm/lib/allLedsOff.js']);
		process.exit();
	}
});
white.watch(function(err, value){
	leds.ledOn('belly');
	var pressTime = new Date();
	while(white.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	console.log('[val : ' + value + ']  White btn pressed for   ' + pressTime + ' sec');
	if(pressTime < 2){
		if(mode.readSync() == 0){
			timer.setTimer();
		}else{
			console.log('no action defined');
		}
	}else if(pressTime > 2 && pressTime < 5){
		utils.reboot();
	}else if(pressTime >= 5){
		utils.shutdown();
	}
	utils.autoMute();
});
blue.watch(function(err, value){
	leds.ledOn('belly');
	var pressTime = new Date();
	while(blue.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	console.log('[val : ' + value + ']  Blue btn pressed for ' + pressTime + ' sec');
	if(pressTime < 2){
		console.log('press < 2');
		if(mode.readSync() == 0){
			jukebox.loop();
		}else{
			jukebox.medley();
		}
	}else if(pressTime > 2){
		console.log('press > 2');
		if(mode.readSync() == 0){
			setTimeout(function(){
				utils.mute();
				leds.allLedsOff();
				console.log('TEST _A_ : mute + clock.setParty(true)');
				clock.setParty(true);
			}, 1200);			
		}else{
			setTimeout(function(){
				utils.mute();
				leds.allLedsOff();
				console.log('TEST _B_ : clock.setParty(false)');
				clock.setParty(false);
			}, 1200);
		}
	}
	utils.autoMute();
});

// ################# events #################
event.on('exclamation2Rappels', function(message){
	console.log('_EventEmited: ' + (message || '.'));
	exclamation.exclamation2Rappels();
});

event.on('playFip', function(message){
	console.log('_EventEmited: ' + (message || '.'));
	fip.playFip();
});
}
module.exports = buttons;
