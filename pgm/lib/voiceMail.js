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
var service = require('./service.js');
var remote = require('./remote.js');
var self = this;

var voiceMailFilePath = '/home/pi/odi/pgm/tmp/voicemail.log';

exports.checkVoiceMail = function checkVoiceMail(callback){
	try{
		console.log('Checking VoiceMail...');
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8').toString().split('\n');
		tts.speak('en', 'You have messages:1');
		console.log(messages);
		tts.conversation(messages);

		setTimeout(function(){ // Clearing VoiceMail
			self.clearVoiceMail();
			console.log('VoiceMail will be cleared in 5 minutes.');
		// }, 2*60*60*1000); // au bout de 2 heures
		}, 5*60*1000); // au bout de 5 minutes
		return true;
	}catch(e){
		if(e.code === 'ENOENT'){
			console.log('No VoiceMail Message !');
			return false;
		}else{
			console.error(e);
		}
	}
};

exports.voiceMailSignal = function voiceMailSignal(){
	console.log('Start checking messages...');
	setInterval(function(){
		fs.access(voiceMailFilePath, fs.R_OK, function(err) {
			// console.error(e);
			if(err == null){
				console.log('blinkBelly');
				leds.blinkBelly(300, 0.8);
			}else{
				console.log('ERROR voiceMailSignal function... TO DEBUG !!') // TO DEBUG !!
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
