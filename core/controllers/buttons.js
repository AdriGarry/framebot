#!/usr/bin/env node

// Module Button

var spawn = require('child_process').spawn;
var leds = require(CORE_PATH + 'modules/leds.js');
var hardware = require(CORE_PATH + 'modules/hardware.js');
var jukebox = require(CORE_PATH + 'modules/jukebox.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
var fip = require(CORE_PATH + 'modules/fip.js');
var utils = require(CORE_PATH + 'modules/utils.js');
var service = require(CORE_PATH + 'modules/service.js');
var time = require(CORE_PATH + 'modules/time.js');
var party = require(CORE_PATH + 'modules/party.js');
// var EventEmitter = require('events').EventEmitter;

module.exports = {
	getEtat: getEtat,
	initButtonAwake: initButtonAwake,
};

/** Function to get switch state */
function getEtat(callback){
	var switchState = etat.readSync();
	return switchState;
};

/** Button initialization in normal mode */
function initButtonAwake(){
	/** Interval pour l'etat du switch + fonctions associees */
	var instance = false;
	var interval;
	setInterval(function(){
		var value = etat.readSync();
		satellite.writeSync(value);
		if(1 === value){
			if(!instance){
				instance = true;
				interval = setInterval(function(){
					console.log('Etat bouton On_');
					service.randomAction();
				}, 10*60*1000); //5*60*1000
			}
		}else{
			instance = false;
			clearInterval(interval);
		}
	}, 2000);

	/** Switch watch for radio volume */
	etat.watch(function(err, value){
		value = etat.readSync();
		console.log('Etat:', value, '[Etat has changed]');
		if(fip.playing){
			fip.stopFip('Rebooting FIP RADIO (volume changed)');
			setTimeout(function(){
				fip.playFip();
			}, 100);
		}
	});

	/** Green (ok) button watch */
	ok.watch(function(err, value){
		var pressTime = new Date();
		while(ok.readSync() == 1){
			; // Pause
			var t = Math.round((new Date() - pressTime)/100)/10;
			if(t%1 == 0){
				// console.log(t);
				belly.write(0);
			}else{
				belly.write(1);
			}
		}
		pressTime = Math.round((new Date() - pressTime)/100)/10;
		leds.ledOff('belly');
		console.log('[val:' + value + ']  Ok btn pressed for ' + pressTime + ' sec [1,2,3;5]');
		if(pressTime < 1){
			if(!voiceMail.checkVoiceMail()){
				service.randomAction();
			}
		}else if(pressTime >= 1 && pressTime < 2){
			tts.lastTTS();
		}else if(pressTime >= 2 && pressTime < 3){
			tts.randomConversation('');
		}else if(pressTime >= 3 && pressTime < 5){
			time.timeNow();
		}else{
			console.log('Push Ok button canceled !');
		}
		hardware.mute(60, 'Random action mute');
	});

	/** Red (cancel) button watch */
	cancel.watch(function(err, value){
		var pressTime = new Date();
		tts.clearTTSQueue();
		hardware.mute();
		while(cancel.readSync() == 1){
			; // Pause
			t = Math.round((new Date() - pressTime)/100)/10;
			if(t%1 == 0){
				belly.write(0);
			}else{
				belly.write(1);
			}
		}
		pressTime = Math.round((new Date() - pressTime)/100)/10;
		leds.ledOff('belly');
		console.log('[val:' + value + ']  Cancel btn pressed for ' + pressTime + ' sec [1,3]');
		// hardware.mute();
		if(pressTime >= 1 && pressTime < 3){
			hardware.restartOdi();
		}else if(pressTime >= 3){
			hardware.restartOdi(255);
		}
	});

	/** White (white) button watch */
	white.watch(function(err, value){
		var pressTime = new Date();
		while(white.readSync() == 1){
			; // Pause
			t = Math.round((new Date() - pressTime)/100)/10;
			if(t%1 == 0){
				belly.write(0);
			}else{
				belly.write(1);
			}
		}
		pressTime = Math.round((new Date() - pressTime)/100)/10;
		leds.ledOff('belly');
		console.log('[val:' + value + ']  White btn pressed for   ' + pressTime + ' sec [2;2]');
		time.setTimer(Math.round(pressTime));
	});

	/** Blue (blue) button watch */
	blue.watch(function(err, value){
		var pressTime = new Date();
		while(blue.readSync() == 1){
			; // Pause
			t = Math.round((new Date() - pressTime)/100)/10;
			if(t%1 == 0){
				belly.write(0);
			}else{
				belly.write(1);
			}
		}
		pressTime = Math.round((new Date() - pressTime)/100)/10;
		leds.ledOff('belly');
		console.log('[val:' + value + ']  Blue btn pressed for ' + pressTime + ' sec [2;5]');
		if(pressTime < 2){
			if(etat.readSync() == 0){
				fip.playFip();
			}else{
				jukebox.loop();
			}
		}else if(pressTime > 2 && pressTime < 5){
			if(etat.readSync() == 0){
				setTimeout(function(){
					hardware.mute();
					leds.allLedsOff();
					console.log('TEST _A_ : mute + party.setParty(true)');
					party.setParty(true);
				}, 1200);			
			}else{
				setTimeout(function(){
					hardware.mute();
					leds.allLedsOff();
					console.log('TEST _B_ : party.setParty(false)');
					party.setParty(false);
				}, 1200);
			}
		}else{
			console.log('Push Blue button canceled !');
		}
	});
	console.log('Buttons initialised');
};