#!/usr/bin/env node

// Module voicemail

var fs = require('fs');
var leds = require(CORE_PATH + 'modules/leds.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var utils = require(CORE_PATH + 'modules/utils.js');

const VOICEMAIL_FILE = '/home/pi/odi/tmp/voicemail.json';
const VOICEMAIL_FILE_HISTORY = '/home/pi/odi/log/voicemailHistory.json';

module.exports = {
	addVoiceMailMessage: addVoiceMailMessage,
	checkVoiceMail: checkVoiceMail,
	voiceMailFlag: voiceMailFlag,
	areThereAnyMessages: areThereAnyMessages,
	clearVoiceMail: clearVoiceMail
};

function addVoiceMailMessage(tts){
	tts = JSON.stringify(tts);
	utils.appendJsonFile(VOICEMAIL_FILE, tts);
	utils.appendJsonFile(VOICEMAIL_FILE_HISTORY, tts);
}


var clearVoiceMailDelay;
function checkVoiceMail(callback){
	// try{
		console.log('Checking VoiceMail...');
		utils.getJsonFileContent(VOICEMAIL_FILE, function(messages){
			if(messages){
				messages = JSON.parse(messages);
				console.debug(messages);
				tts.speak({voice:'espeak', lg:'en', msg:'Messages'});
				tts.speak(messages);
				if(clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
				clearVoiceMailDelay = setTimeout(function(){ // Clearing VoiceMail
					clearVoiceMail();
				}, 10*60*1000);
				console.log('VoiceMail will be cleared in 10 minutes.');
				if(callback) callback(true); // for other action
			}else{
				console.log('No VoiceMail Message');
		 		if(callback) callback(false); // for other action
			}
		});
	// }catch(e){
	// 	if(e.code === 'ENOENT'){
	// 		console.log('No VoiceMail Message');
	// 		return false;
	// 	}else{
	// 		console.error(e);
	// 	}
	// }
}

function voiceMailFlag(){
	console.log('Starting voiceMail flag...');
	var nbMessages;
	setInterval(function(){
		nbMessages = areThereAnyMessages();
		if(nbMessages > 0){ // if(nbMessages)
			leds.blink({leds: ['belly'], speed: 200, loop: 2});
		}
	}, 5000);
}

/** Function to return number of voicemail message(s) */
function areThereAnyMessages(){
	var nbMessages = 0;
	try{
		var messages = fs.readFileSync(VOICEMAIL_FILE, 'UTF-8');
		messages = JSON.parse(messages);
		nbMessages = messages.length;
		// utils.getJsonFileContent(VOICEMAIL_FILE, function(messages){
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
}

/** Function to clear all voicemail messages */
function clearVoiceMail(){
	fs.unlink(VOICEMAIL_FILE, function(err){
		if(err){
			if(err.code === 'ENOENT') console.log('clearVoiceMail : No message to delete !');
		}else{
			console.log('VoiceMail Cleared.');
			tts.speak({lg:'en', voice: 'google', msg:'VoiceMail Cleared'});
		}
	});
}
