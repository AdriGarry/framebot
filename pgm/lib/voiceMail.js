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

var checkVoiceMail = function(callback){
	try{
		console.log('Checking VoiceMail...');
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8').toString().split('\n');
		tts.speak('en', 'VoiceMail:1');
		console.log(messages);
		tts.conversation(messages);

		setTimeout(function(){ // Clearing VoiceMail
			self.clearVoiceMail();
		}, 2*60*60*1000); // au bout de 2 heures
		// }, 1*60*1000); // au bout d'1 minute
		return true;
	}catch(e){
		if(e.code === 'ENOENT'){
			console.log('No VoiceMail Message !');
			// callback(false);
			return false;
		}else{
			console.error(e);
		}
	}
}
exports.checkVoiceMail = checkVoiceMail;

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

var clearVoiceMail = function(){
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearVoiceMail']);
	console.log('VoiceMail Cleared.');
};
exports.clearVoiceMail = clearVoiceMail;