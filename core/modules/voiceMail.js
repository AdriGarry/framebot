#!/usr/bin/env node

// Module voicemail

var fs = require('fs');
/*var leds = require(CORE_PATH + 'modules/leds.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var utils = require(CORE_PATH + 'modules/utils.js');*/

const VOICEMAIL_FILE = '/home/pi/odi/tmp/voicemail.json';
const VOICEMAIL_FILE_HISTORY = '/home/pi/odi/log/voicemailHistory.json';

module.exports = {
	messages: messages,
	addVoiceMailMessage: addVoiceMailMessage,
	checkVoiceMail: checkVoiceMail,
	voiceMailFlag: voiceMailFlag,
	areThereAnyMessages: areThereAnyMessages,
	clearVoiceMail: clearVoiceMail
};

var messages; // TODO....
fs.readFile(VOICEMAIL_FILE, 'utf8', function(err, data){
	// if(err) console.log('No VoiceMail message (NEW)');
	if(err) return;
	else{
		messages = JSON.parse(data);
		// fileData.push(obj);
	}
	console.log('messages', messages);
});

/** Function to persist voicemail message */
function addVoiceMailMessage(tts){
	console.log('New voicemail message :', tts);
	tts = JSON.stringify(tts);
	ODI.utils.appendJsonFile(VOICEMAIL_FILE, tts);
	ODI.utils.appendJsonFile(VOICEMAIL_FILE_HISTORY, tts);
};

var clearVoiceMailDelay;
/** Function to check voicemail, and play */
function checkVoiceMail(callback){
	// try{
		console.log('Checking VoiceMail...');
		ODI.utils.getJsonFileContent(VOICEMAIL_FILE, function(messages){
			if(messages){
				messages = JSON.parse(messages);
				console.debug(messages);
				ODI.tts.speak({voice:'espeak', lg:'en', msg:'Messages'});
				ODI.tts.speak(messages);
				if(clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
				clearVoiceMailDelay = setTimeout(function(){ // Clearing VoiceMail
					clearVoiceMail();
				}, 15*60*1000);
				console.log('VoiceMail will be cleared in 10 minutes.');
				// if(callback) callback(true); // for other action
				//callback(true);
				return true;
			}else{
				console.log('No VoiceMail Message');
		 		// if(callback) callback(false); // for other action
		 		//callback(false);
		 		return false;
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
};

/** Function voicemail flag (blink belly if any message) */
function voiceMailFlag(){
	console.log('Starting voiceMail flag...');
	var nbMessages;
	setInterval(function(){
		nbMessages = areThereAnyMessages();
		if(nbMessages > 0){ // if(nbMessages)
			ODI.leds.blink({leds: ['belly'], speed: 200, loop: 2});
		}
	}, 5000);
};

/** Function to return number of voicemail message(s) */
function areThereAnyMessages(){
	var nbMessages = 0;
	try{
		var messages = fs.readFileSync(VOICEMAIL_FILE, 'UTF-8');
		messages = JSON.parse(messages);
		nbMessages = messages.length;
	}catch(e){
		nbMessages = 0;
	}
	return nbMessages;
	//console.debug('AreThereAnyMessages ? ' + (nbMessages > 0 ? 'YES, ' + nbMessages + ' messages !' : 'NO'));
};

/** Function to clear all voicemail messages */
function clearVoiceMail(){
	fs.unlink(VOICEMAIL_FILE, function(err){
		if(err){
			if(err.code === 'ENOENT') console.log('clearVoiceMail : No message to delete !');
		}else{
			console.log('VoiceMail Cleared !');
			ODI.tts.speak({lg:'en', voice: 'google', msg:'VoiceMail Cleared'});
		}
	});
};
