#!/usr/bin/env node
// Module de gestion des boutons

var log = 'Odi/ ';
var spawn = require('child_process').spawn;
var leds = require('./leds.js');
var exclamation = require('./exclamation.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');
var clock = require('./clock.js');
var party = require('./party.js');
var EventEmitter = require('events').EventEmitter;
// var event = new EventEmitter();
var utils = require('./utils.js');

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
var interval;
setInterval(function(){
	var value = mode.readSync();
	satellite.writeSync(value);
	if(1 === value){
		if(!instance){
			instance = true;
			interval = setInterval(function(){
				utils.randomAction();
			}, 5*60*1000); //5*60*1000
		}
	}else{
		instance = false;
		clearInterval(interval);
	}
}, 1000);

var getMode = function(callback){
	var value = mode.readSync();
	console.log('Mode : ' + value)
	callback(value);
};
exports.getMode = getMode;

ok.watch(function(err, value){
	leds.ledOn('belly');
	var pressTime = new Date();
	while(ok.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	console.log('[val:' + value + ']  Ok btn pressed for ' + pressTime + ' sec');
	if(pressTime < 1){
		utils.randomAction();
		// exclamation.exclamation2Rappels();
	}else if(pressTime >= 1 && pressTime < 4){
		// event.emit('playFip', 'Fip Radio');
		fip.playFip();
	}else{
		console.log('Push Ok button canceled !');
	}
	utils.autoMute();
});

cancel.watch(function(err, value){
	leds.ledOn('belly');
	// leds.buttonPush();
	var pressTime = new Date();
	while(cancel.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	leds.buttonPush('stop');
	console.log('[val:' + value + ']  Cancel btn pressed for ' + pressTime + ' sec');
	utils.mute();
	if(pressTime >= 1 && pressTime < 4){
		utils.restartOdi();
	}else{
		// console.log('Push Cancel button canceled !');
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
	console.log('[val:' + value + ']  White btn pressed for   ' + pressTime + ' sec');
	if(pressTime < 2){
		if(mode.readSync() == 0){
			timer.setTimer();
		}else{
			console.log('no action defined');
		}
	}else{
		console.log('Push White button canceled !');
	}
});
blue.watch(function(err, value){
	leds.ledOn('belly');
	var pressTime = new Date();
	while(blue.readSync() == 1){
		;
	}
	pressTime = Math.round((new Date() - pressTime)/100)/10;
	leds.ledOff('belly');
	console.log('[val:' + value + ']  Blue btn pressed for ' + pressTime + ' sec');
	if(pressTime < 2){
		console.log('press < 2');
		if(mode.readSync() == 0){
			jukebox.loop();
		}else{
			jukebox.medley();
		}
	}else if(pressTime > 2 && pressTime < 5){
		console.log('press > 2');
		if(mode.readSync() == 0){
			setTimeout(function(){
				utils.mute();
				leds.allLedsOff();
				console.log('TEST _A_ : mute + party.setParty(true)');
				party.setParty(true);
			}, 1200);			
		}else{
			setTimeout(function(){
				utils.mute();
				leds.allLedsOff();
				console.log('TEST _B_ : party.setParty(false)');
				party.setParty(false);
			}, 1200);
		}
	}else{
		console.log('Push Blue button canceled !');
	}
});

// ################# events #################
// event.on('exclamation2Rappels', function(message){
	// console.log('_EventEmited: ' + (message || '.'));
	// exclamation.exclamation2Rappels();
// });

// event.on('playFip', function(message){
	// console.log('_EventEmited: ' + (message || '.'));
	// fip.playFip();
// });