#!/usr/bin/env node
// Module utilitaires

// var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var leds = require('./leds.js');
// var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var exclamation = require('./exclamation.js');
var tts = require('./tts.js');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
// var service = require('./service.js');
// var remote = require('./remote.js');
var self = this;

var voiceMailFilePath = '/home/pi/odi/pgm/tmp/voicemail.log';
var voiceMailFilePathHistory = '/home/pi/odi/log/voicemailHistory.log';

exports.addVoiceMailMessage = function addVoiceMailMessage(lg, txt){
	var message = lg + ';' + txt; // AJOUTER HEURE + DATE ??
	fs.appendFile(voiceMailFilePath, message + '\r\n', function(err){ //writeFile
		if(err)	return console.error(err);
		// leds.blinkBelly(300, 0.8);
		leds.blink({
			leds: ['belly'],
			speed: 250,//Math.random() * (200 - 30) + 30,
			loop: 2//4
		});
		console.log('New VoiceMail Message_: ' + message);
	});
	fs.appendFile(voiceMailFilePathHistory, message + '\r\n', function(err){ //writeFile
		if(err){
			return console.error(err);
		}
	});
};

var clearVoiceMailDelay;
exports.checkVoiceMail = function checkVoiceMail(callback){
	try{
		console.log('Checking VoiceMail...');
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8').toString().split('\n');
		// tts.speak('en', 'You have messages:1');
		tts.speak('en', 'Messages:1');
		console.log(messages);
		tts.conversation(messages);

		if(clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
		clearVoiceMailDelay = setTimeout(function(){ // Clearing VoiceMail
			self.clearVoiceMail();
		}, 10*60*1000);
		console.log('VoiceMail will be cleared in 5 minutes.');
		return true;
	}catch(e){
		if(e.code === 'ENOENT'){
			console.log('No VoiceMail Message');
			return false;
		}else{
			console.error(e);
		}
	}
};

exports.voiceMailFlag = function voiceMailFlag(){
	console.log('Starting voiceMail flag...');
	setInterval(function(){
		fs.access(voiceMailFilePath, fs.R_OK, function(err) {
			// console.error(e);
			if(err == null){
				// leds.blinkBelly(300, 0.8);
				leds.blink({
					leds: ['belly'],
					speed: 250,//Math.random() * (200 - 30) + 30,
					loop: 2//4
				});
			}else{
				// console.log('ERROR voiceMailFlag function... TO DEBUG !!') // TO DEBUG !!
			}
		});
	}, 5000);
};

exports.clearVoiceMail = function clearVoiceMail(){
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearVoiceMail']);

	fs.unlink(voiceMailFilePath, function(err){ // SUPPRIMER METHODE SH
		if(err){
			if(err.code === 'ENOENT') console.log('clearVoiceMail : No message to delete !');
		}else{
			console.log('VoiceMail Cleared.');
			tts.speak('en', 'VoiceMail Cleared:3');
		}
	});
};

