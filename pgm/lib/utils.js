#!/usr/bin/env node
// Module utilitaires

// var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var leds = require('./leds.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var exclamation = require('./exclamation.js');
var tts = require('./tts.js');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var clock = require('./clock.js');
var service = require('./service.js');
var remote = require('./remote.js');
var self = this;

var mute = function(message){
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	console.log(((message === undefined)? '' : message) + ' >> MUTE  :|');
	leds.clearLeds();
	eye.write(0);
	belly.write(0);
	// AJOUTER ARRET FIP (cf fip functions...) -> stopFip() ???
};
exports.mute = mute;

var muteTimer;
var autoMute = function(message){
	clearTimeout(muteTimer);
	muteTimer = setTimeout(function(){
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh', 'auto']);
		setTimeout(function(){
			deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
			console.log(((message === undefined)? '' : message) + ' >> AUTO MUTE  :|');
			leds.clearLeds();
			eye.write(0);
			belly.write(0);
			// AJOUTER ARRET FIP (cf fip functions...) -> stopFip() ???
		}, 1600);
	}, 60*60*1000);
};
exports.autoMute = autoMute;

var randomAction = function(){
	self.testConnexion(function(connexion){
		if(!connexion){
			exclamation.exclamation2Rappels();
		}else{
			var rdm = Math.floor(Math.random()*14); // 1->13
			console.log('> randomAction [rdm = ' + rdm + ']');
			switch(rdm){
				case 1:
				case 2:
				case 3:
				case 4:
					tts.speak('','');
					break;
				case 5:
					service.time();
					break;
				case 6:
					service.date();
					break;
				case 7:
				case 8:
					service.weather();
					break;
				case 9:
					service.cpuTemp();
					break;
				default:
					exclamation.exclamation2Rappels();
			}
		}		
	});
};
exports.randomAction = randomAction;

var testConnexion = function(callback){
	require('dns').resolve('www.google.com', function(err) {
		if(err){
			//console.error('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		}else{
			//console.log('Odi is online   :');
			callback(true);
		}
	});
};
exports.testConnexion = testConnexion;

var clearLastTTS = function(){
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearLastTTS']);
	// console.log('LastTTS deleted.');
};
exports.clearLastTTS = clearLastTTS;

var clearVoiceMail = function(){
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearVoiceMail']);
	console.log('VoiceMail Cleared.');
};
exports.clearVoiceMail = clearVoiceMail;

var voiceMailFilePath = '/home/pi/odi/pgm/tmp/voicemail.log';
var voiceMailSignal = function(){
	console.log('Start checking messages...');
	setInterval(function(){
		fs.access(voiceMailFilePath, fs.R_OK, function(e) {
			// console.error(e);
			if(e == null){
				console.log('blinkBelly');
				leds.blinkBelly(300, 0.8);
			}else{
				// No message
			}
		});
	}, 5000);
};
exports.voiceMailSignal = voiceMailSignal;

var sleepNode = function(sec, delay){
	/*if(delay){
		delay = 0;
	}*/
	//if(isNaN (parseFloat(delay)){
	//if(typeof delay == "number"){
	if(delay > 0){
		console.log('\nOdi is going to fall asleep in ' + delay + 'sec ...');
	} else {
		delay = 0;
	}
	console.log('\nsleepNode: Odi falling asleep for ' + sec + 'sec !');
	setTimeout(function(){
		var wakeUp = new Date().getTime() + (sec * 1000);
		while (new Date().getTime() <= wakeUp) {
			;
		}
		console.log('\nsleepNode:       -->  Odi going on !!\n');
	}, delay*1000+1);	
};
exports.sleepNode = sleepNode;

var reboot = function(){
	self.clearLastTTS();
	remote.check();
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'reboot']);
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/power.sh', 'reboot']);
	}, 1500);
};
exports.reboot = reboot;

var shutdown = function(){
	self.clearLastTTS();
	remote.check();
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'shutdown']);
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI  -- DON\'T FORGET TO SWITCH OFF POWER SUPPLY!!');
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/power.sh']);
	}, 1500);
};
exports.shutdown = shutdown;

var restartOdi = function(mode){
	// if(mode == 'sleep'){
	if(typeof mode === 'undefined'){
		console.log('Restarting Odi !!');
		setTimeout(function(){
			process.exit();
		}, 300); //500
	}else{
		if(mode.indexOf('sleep') > -1){
			console.log('Sleeping Odi ...  [' + mode + ']');
			setTimeout(function(){
				if(mode.indexOf('sleepWakeUp') > -1){
					process.exit(14);
				}else{
					process.exit(13);
				}
				// process.exit(mode);
			}, 300); //500
		}else{
			console.log('Restarting Odi !!');
			setTimeout(function(){
				process.exit();
			}, 300); //500
		}
	}
};
exports.restartOdi = restartOdi;

var getMsgLastGitCommit = function(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: '/home/pi/odi/'}, getMsg);
};
exports.getMsgLastGitCommit = getMsgLastGitCommit;
