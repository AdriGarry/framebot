#!/usr/bin/env node

// Module voicemail

var fs = require('fs');
// var spawn = require('child_process').spawn;
var leds = require('./leds.js');
var tts = require('./tts.js');
var utils = require('./utils.js');

const self = this;

// const voiceMailFilePath = '/home/pi/odi/tmp/voicemail.log';
const voiceMailFilePath = '/home/pi/odi/tmp/voicemail.json';
// const voiceMailFilePathHistory = '/home/pi/odi/log/voicemailHistory.log';
const voiceMailFilePathHistory = '/home/pi/odi/log/voicemailHistory.json';

// function addVoiceMailMessage(lg, txt){
function addVoiceMailMessage(tts){
	tts = JSON.stringify(tts);
	console.log(tts);
	/*var messages = require('voiceMailFilePath.json');
	fs.appendFile(voiceMailFilePath, tts + '\r\n', function(err){ //writeFile
		if(err)	return console.error(err);
		leds.blink({
			leds: ['belly'],
			speed: 250,
			loop: 2
		});
		console.log('New VoiceMail Message_: ' + tts);
	});
	fs.appendFile(voiceMailFilePathHistory, tts + '\r\n', function(err){ //writeFile
		if(err){
			return console.error(err);
		}
	});*/
	utils.appendJsonFile(voiceMailFilePath, tts);
	utils.appendJsonFile(voiceMailFilePathHistory, tts);
};
exports.addVoiceMailMessage = addVoiceMailMessage;


// FONCTION GENERIQUE POUR RECUPERER LES MESSAGES


var clearVoiceMailDelay;
function checkVoiceMail(callback){
	try{
		console.log('Checking VoiceMail...');
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8');//.toString().split('\n')
		messages = JSON.parse(messages);
		console.log(messages);
		tts.speak({voice:'espeak', lg:'en', msg:'Messages'});
		tts.speak(messages);
		if(clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
		clearVoiceMailDelay = setTimeout(function(){ // Clearing VoiceMail
			self.clearVoiceMail();
		}, 10*60*1000);
		console.log('VoiceMail will be cleared in 10 minutes.');
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
exports.checkVoiceMail = checkVoiceMail;

exports.voiceMailFlag = function voiceMailFlag(){
	console.log('Starting voiceMail flag...');
	var nbMessages;
	setInterval(function(){
		nbMessages = areThereAnyMessages();
		if(nbMessages > 0){
			//console.log('Odi have ' + nbMessages + ' message(s)');
			leds.blink({
				leds: ['belly'],
				speed: 200,
				loop: 2
			});
		}
		/*fs.access(voiceMailFilePath, fs.R_OK, function(err) {
			console.error(err);
			if(err == null){
				// leds.blinkBelly(300, 0.8);
				leds.blink({
					leds: ['belly'],
					speed: 250,
					loop: 2
				});
			}else{
				// console.log('ERROR voiceMailFlag function... TO DEBUG !!') // TO DEBUG !!
			}
		});*/
	}, 5000);
};

/** Function to return number of voicemail message(s) */
var areThereAnyMessages = function(){
	var nbMessages;
	try{
		// nbMessages = fs.readFileSync(voiceMailFilePath, 'UTF-8').toString().split('\n').length -1;
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8');
		console.log('areThereAnyMessages()');
		console.log(messages);
	}catch(e){
		nbMessages = 0;
	}
	/*console.log('AreThereAnyMessages ? '
		+ (nbMessages > 0 ? 'YES, ' + nbMessages + ' messages !' : 'NO'));*/
	return nbMessages
};
exports.areThereAnyMessages = areThereAnyMessages;

/** Function to clear all voicemail messages */
function clearVoiceMail(){
	fs.unlink(voiceMailFilePath, function(err){
		if(err){
			if(err.code === 'ENOENT') console.log('clearVoiceMail : No message to delete !');
		}else{
			console.log('VoiceMail Cleared.');
			// tts.speak('en', 'VoiceMail Cleared:3');
			tts.speak({lg:'en', voice: 'google', msg:'VoiceMail Cleared'});
		}
	});
};
exports.clearVoiceMail = clearVoiceMail;
