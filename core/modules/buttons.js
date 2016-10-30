#!/usr/bin/env node

// Module de gestion des boutons

var log = 'Odi/ ';
var spawn = require('child_process').spawn;
var leds = require('./leds.js');
// var exclamation = require('./exclamation.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');
var voiceMail = require('./voiceMail.js');
var party = require('./party.js');
var EventEmitter = require('events').EventEmitter;
// var event = new EventEmitter();
var utils = require('./utils.js');
var service = require('./service.js');

/** Fonction pour recuperer l'etat du switch */
var getEtat = function(callback){
	var switchState = etat.readSync();
	// console.log('Switch state : ' + switchState)
	//callback(switchState);
	return switchState;
};
exports.getEtat = getEtat;

/** Initialisation des boutons mode normal */
exports.initButtonAwake = function initButtonAwake(){
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

	/** Association switch pour volume radio */
	etat.watch(function(err, value){
		value = etat.readSync();
		console.log(' Etat: ' + value + ' [Etat has changed]');
		if(fip.instance){
			fip.stopFip('Rebooting FIP RADIO (volume changed)');
			setTimeout(function(){
				fip.playFip();
			}, 100);
		}
		utils.autoMute();
	});

	var t;
	/** Association actions bouton Vert */
	ok.watch(function(err, value){
		var pressTime = new Date();
		while(ok.readSync() == 1){
			; // Pause
			t = Math.round((new Date() - pressTime)/100)/10;
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
			// event.emit('playFip', 'Fip Radio');
			// fip.playFip();
			if(etat.readSync() == 1){
				tts.conversation('');
			}else{
				tts.conversation('random');
			}
		}else if(pressTime >= 3 && pressTime < 5){
			service.timeNow();
		}else{
			console.log('Push Ok button canceled !');
		}
		utils.autoMute();
	});

	/** Association actions bouton Rouge */
	cancel.watch(function(err, value){
		var pressTime = new Date();
		utils.mute();
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
		// utils.mute();
		if(pressTime >= 1 && pressTime < 3){
			utils.restartOdi();
		}else if(pressTime >= 3){
			utils.restartOdi(255);
		}
		// job.stop();
	});

	/** Association actions bouton Blanc */
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
		service.setTimer(Math.round(pressTime));
		/*if(pressTime < 2){
			if(etat.readSync() == 0){
				timer.setTimer();
			}else{
				console.log('no action defined');
			}
		}else{
			console.log('Push White button canceled !');
		}*/
	});

	/** Association actions bouton Bleu */
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
				// jukebox.medley();
				// event.emit('playFip', 'Fip Radio');
				fip.playFip();
			}else{
				jukebox.loop();
			}
		}else if(pressTime > 2 && pressTime < 5){
			if(etat.readSync() == 0){
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

	console.log('Buttons actions initialised');
};

// ################# events #################
// event.on('exclamation2Rappels', function(message){
	// console.log('_EventEmited: ' + (message || '.'));
	// exclamation.exclamation2Rappels();
// });

// event.on('playFip', function(message){
	// console.log('_EventEmited: ' + (message || '.'));
	// fip.playFip();
// });