#!/usr/bin/env node
// Module de gestion des boutons

var log = 'Odi/ ';
var spawn = require('child_process').spawn;
var remote = require('./remote.js');
var leds = require('./leds.js');
var exclamation = require('./exclamation.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');
var voiceMail = require('./voiceMail.js');
var clock = require('./clock.js');
var party = require('./party.js');
var EventEmitter = require('events').EventEmitter;
// var event = new EventEmitter();
var utils = require('./utils.js');
var service = require('./service.js');

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
				utils.randomAction();
			}, 10*60*1000); //5*60*1000
		}
	}else{
		instance = false;
		clearInterval(interval);
	}
}, 1000);

var getEtat = function(callback){
	var value = etat.readSync();
	console.log('Etat : ' + value)
	callback(value);
};
exports.getEtat = getEtat;

var t;
ok.watch(function(err, value){
	var pressTime = new Date();
	while(ok.readSync() == 1){
		;
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
		// voiceMail.checkVoiceMail(function(r){
			// console.error('RETURN  ' + r);
			// if(!r){
				// utils.randomAction();
			// }
		// });
		// exclamation.exclamation2Rappels();
		utils.randomAction();
	}else if(pressTime >= 1 && pressTime < 2){
		tts.lastTTS();
	}else if(pressTime >= 2 && pressTime < 3){
		// event.emit('playFip', 'Fip Radio');
		// fip.playFip();
	}else if(pressTime >= 3 && pressTime < 5){
		service.time();
	}else{
		console.log('Push Ok button canceled !');
	}
	utils.autoMute();
});

cancel.watch(function(err, value){
	var pressTime = new Date();
	while(cancel.readSync() == 1){
		;
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
	console.log('[val:' + value + ']  Cancel btn pressed for ' + pressTime + ' sec [1,3]');
	utils.mute();
	if(pressTime >= 1 && pressTime < 3){
		utils.restartOdi();
	}else if(pressTime >= 3){
		if(etat.readSync() == 1){
			utils.restartOdi('sleepWakeUp');
		}else{
			utils.restartOdi('sleep');
		}
	}
	// console.log('Killing __Test');
	// job.stop();
});
////////////////////////////////
// var CronJob = require('cron').CronJob;
	// var job = new CronJob('* * * * * *', function(){
			// console.log('__Test');
	// }, null, true, 'Europe/Paris');
////////////////////////////////
white.watch(function(err, value){
	var pressTime = new Date();
	while(white.readSync() == 1){
		;
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
	console.log('[val:' + value + ']  White btn pressed for   ' + pressTime + ' sec [2;2]');
	timer.setTimer(Math.round(pressTime));
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
blue.watch(function(err, value){
	var pressTime = new Date();
	while(blue.readSync() == 1){
		;
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
	console.log('[val:' + value + ']  Blue btn pressed for ' + pressTime + ' sec [2;5]');
	if(pressTime < 2){
		if(etat.readSync() == 0){
			jukebox.loop();
		}else{
			// jukebox.medley();
			// event.emit('playFip', 'Fip Radio');
			fip.playFip();
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

// ################# events #################
// event.on('exclamation2Rappels', function(message){
	// console.log('_EventEmited: ' + (message || '.'));
	// exclamation.exclamation2Rappels();
// });

// event.on('playFip', function(message){
	// console.log('_EventEmited: ' + (message || '.'));
	// fip.playFip();
// });