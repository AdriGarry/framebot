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
			addVoiceMailMessage(flux.value);
		}else if(flux.id == 'check'){
			checkVoiceMail();
		}else if(flux.id == 'clear'){
			clearVoiceMail();
		}else Odi.error('unmapped flux in Voicemail service', flux, false);
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
	setTimeout(function(){
		updateVoicemailMessage();
	}, 1000);
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
			// log.info('VoiceMail will be cleared in 10 minutes.');
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
	updateVoicemailMessage();
	setInterval(function(){
		updateVoicemailMessage();
	}, 10000);
})();

/** Function to return number of voicemail message(s) */
function updateVoicemailMessage(){
	try{
		var messages = fs.readFileSync(VOICEMAIL_FILE, 'UTF-8');
		messages = JSON.parse(messages);
		Odi.run.voicemail = messages.length;
		if(Odi.run.voicemail > 0){
			Flux.next('module', 'led', 'blink', {leds: ['belly'], speed: 200, loop: 2}, null, null, true);
		}
	}catch(e){
		Odi.run.voicemail = 0;
	}
};

/** Function to clear all voicemail messages */
function clearVoiceMail(){
	fs.unlink(VOICEMAIL_FILE, function(err){
		if(err){
			if(err.code === 'ENOENT') log.info('clearVoiceMail : No message to delete !');
			else Odi.error(err);
		}else{
			updateVoicemailMessage();
			Flux.next('module', 'tts', 'speak', {lg:'en', msg:'VoiceMail Cleared'});
		}
	});
};
