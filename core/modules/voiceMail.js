#!/usr/bin/env node

// Module voicemail

var fs = require('fs');
// var spawn = require('child_process').spawn;
var leds = require('./leds.js');
var tts = require('./tts.js');
var utils = require('./utils.js');

const self = this;

const voiceMailFilePath = '/home/pi/odi/tmp/voicemail.json';
const voiceMailFilePathHistory = '/home/pi/odi/log/voicemailHistory.json';

// function addVoiceMailMessage(lg, txt){
function addVoiceMailMessage(tts){
	tts = JSON.stringify(tts);
	console.log(tts);
	utils.appendJsonFile(voiceMailFilePath, tts);
	utils.appendJsonFile(voiceMailFilePathHistory, tts);
};
exports.addVoiceMailMessage = addVoiceMailMessage;


// FONCTION GENERIQUE POUR RECUPERER LES MESSAGES => UTILS.JS => utils.getJsonFileContent()


var clearVoiceMailDelay;
function checkVoiceMail(cb){
	// try{
		console.log('Checking VoiceMail...');
		utils.getJsonFileContent(voiceMailFilePath, function(messages){
			if(messages){
				messages = JSON.parse(messages);
				console.debug(messages);
				tts.speak({voice:'espeak', lg:'en', msg:'Messages'});
				tts.speak(messages);
				if(clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
				clearVoiceMailDelay = setTimeout(function(){ // Clearing VoiceMail
					self.clearVoiceMail();
				}, 10*60*1000);
				console.log('VoiceMail will be cleared in 10 minutes.');
				cb(true); // for other action
			}else{
				console.log('No VoiceMail Message');
		 		cb(false); // for other action
			}
		}, callback);
	// }catch(e){
	// 	if(e.code === 'ENOENT'){
	// 		console.log('No VoiceMail Message');
	// 		return false;
	// 	}else{
	// 		console.error(e);
	// 	}
	// }
};
exports.checkVoiceMail = checkVoiceMail;

exports.voiceMailFlag = function voiceMailFlag(){
	console.log('Starting voiceMail flag...');
	var nbMessages;
	setInterval(function(){
		// nbMessages = areThereAnyMessages();
		areThereAnyMessages(function(nbMessages){
			console.log('nbMessages : ', nbMessages);
			if(nbMessages > 0){ // if(nbMessages)
				//console.log('Odi have ' + nbMessages + ' message(s)');
				leds.blink({leds: ['belly'], speed: 200, loop: 2});
			}
		});
	}, 5000);
};

/** Function to return number of voicemail message(s) */
var areThereAnyMessages = function(){
	var nbMessages = 0;
	try{
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8');
		messages = JSON.parse(messages);
		nbMessages = messages.length;
		// utils.getJsonFileContent(voiceMailFilePath, function(messages){
		// 	if(messages){
		// 		messages = JSON.parse(messages);
		// 		nbMessages = messages.length; // -1 ?
		// 		console.log(nbMessages);
		// 		return nbMessages || 0;
		// 	}
		// });

	}catch(e){
		nbMessages = 0;
	}
	return nbMessages;
	//console.debug('AreThereAnyMessages ? ' + (nbMessages > 0 ? 'YES, ' + nbMessages + ' messages !' : 'NO'));
};
exports.areThereAnyMessages = areThereAnyMessages;

/** Function to clear all voicemail messages */
function clearVoiceMail(){
	fs.unlink(voiceMailFilePath, function(err){
		if(err){
			if(err.code === 'ENOENT') console.log('clearVoiceMail : No message to delete !');
		}else{
			console.log('VoiceMail Cleared.');
			tts.speak({lg:'en', voice: 'google', msg:'VoiceMail Cleared'});
		}
	});
};
exports.clearVoiceMail = clearVoiceMail;