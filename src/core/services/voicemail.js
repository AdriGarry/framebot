#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var fs = require('fs');

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');

Flux.service.voicemail.subscribe({
	next: flux => {
		log.info('VoiceMail service', flux);
		if(flux.id == 'new'){
			console.log('TOTO44');
			addVoiceMailMessage(flux.value);
		}else if(flux.id == 'check'){
			checkVoiceMail();
		}else if(flux.id == 'clear'){
			clearVoiceMail();
		}else Odi.error('unmapped flux in Voicemail service:' + flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

const DELAY_TO_CLEAR_VOICEMAIL = 6*60*60*1000;//15*60*1000;
const VOICEMAIL_FILE = Odi._TMP + 'voicemail.json';
const VOICEMAIL_FILE_HISTORY = Odi._LOG + 'voicemailHistory.json';

/** Function to persist voicemail message */
function addVoiceMailMessage(tts){
	log.info('New voicemail message :', tts);
	tts = JSON.stringify(tts);
	Utils.appendJsonFile(VOICEMAIL_FILE, tts);
	Utils.appendJsonFile(VOICEMAIL_FILE_HISTORY, tts);
};

var clearVoiceMailDelay;
/** Function to check voicemail, and play */
function checkVoiceMail(callback){
	log.debug('Checking VoiceMail...');
	Utils.getJsonFileContent(VOICEMAIL_FILE, function(messages){
		if(messages){
			messages = JSON.parse(messages);
			log.debug(messages);
			Flux.next('module', 'tts', 'speak', {voice:'espeak', lg:'en', msg:'Messages'});
			Flux.next('module', 'tts', 'speak', messages);
			if(clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
			clearVoiceMailDelay = setTimeout(function(){ // Clearing VoiceMail
				clearVoiceMail();
			}, DELAY_TO_CLEAR_VOICEMAIL);
			// console.log('VoiceMail will be cleared in 10 minutes.');
			log.info('VoiceMail will be cleared in 6 hours.');
			if(callback) callback(true); // for other action
			//callback(true);
			return true;
		}else{
			log.info('No VoiceMail Message');
			if(callback) callback(false); // for other action
			return false;
		}
	});
};

/** Function voicemail flag (blink belly if any message) */
(function voiceMailFlag(){
	log.info('VoiceMail flag initialized');
	var nbMessages;
	setInterval(function(){
		nbMessages = areThereAnyMessages();
		if(nbMessages > 0){ // if(nbMessages)
			Flux.next('module', 'led', 'blink', {leds: ['belly'], speed: 200, loop: 2}, null, null, true);
		}
	}, 10000);
})();

/** Function to return number of voicemail message(s) */
function areThereAnyMessages(){
	var nbMessages = 0;
	try{
		var messages = fs.readFileSync(VOICEMAIL_FILE, 'UTF-8');
		messages = JSON.parse(messages);
		nbMessages = messages.length;
		if(Odi.run.voicemail != nbMessages) Odi.run.voicemail = nbMessages;
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
			if(err.code === 'ENOENT') log.info('clearVoiceMail : No message to delete !');
			else Odi.error(err);
		}else{
			log.info('VoiceMail Cleared !');
			Flux.next('module', 'tts', 'speak', {lg:'en', voice: 'google', msg:'VoiceMail Cleared'});
		}
	});
};
