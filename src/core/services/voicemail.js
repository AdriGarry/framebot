#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename);
const Flux = require(Odi._CORE + 'Flux.js');
const Utils = require(Odi._CORE + 'Utils.js');
const fs = require('fs');

Flux.service.voicemail.subscribe({
	next: flux => {
		if (flux.id == 'new') {
			addVoiceMailMessage(flux.value);
		} else if (flux.id == 'check') {
			checkVoiceMail(flux.value);
		} else if (flux.id == 'clear') {
			clearVoiceMail();
		} else Odi.error('unmapped flux in Voicemail service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

const DELAY_TO_CLEAR_VOICEMAIL = 60 * 60 * 1000; //15*60*1000;
const VOICEMAIL_FILE = Odi._TMP + 'voicemail.json';
const VOICEMAIL_FILE_HISTORY = Odi._LOG + 'voicemailHistory.json';

updateVoicemailMessage();
log.info('VoiceMail flag initialized');
setInterval(function() {
	updateVoicemailMessage();
}, 10000);

/** Function to persist voicemail message */
function addVoiceMailMessage(tts) {
	log.info('New voicemail message :', tts);
	if (typeof tts === 'object' && tts.hasOwnProperty('msg') && typeof tts.msg === 'string') {
		tts = JSON.stringify(tts);
		Utils.appendJsonFile(VOICEMAIL_FILE, tts);
		Utils.appendJsonFile(VOICEMAIL_FILE_HISTORY, tts);
		setTimeout(function() {
			updateVoicemailMessage();
		}, 1000);
	} else if (Array.isArray(tts)) {
		// log.INFO('______array message');
		for (var i = 0; i < tts.length; i++) {
			addVoiceMailMessage(tts[i]);
		}
	} else {
		Odi.error("Wrong tts, can't save voicemail", tts);
		return;
	}
}

var clearVoiceMailDelay;
const NO_VOICEMAIL = 'No voiceMail message';
/** Function to check voicemail, and play */
function checkVoiceMail(withTTSResult, callback) {
	log.debug('Checking VoiceMail...');
	Utils.getJsonFileContent(VOICEMAIL_FILE, function(messages) {
		if (messages) {
			messages = JSON.parse(messages);
			log.debug(messages);
			Flux.next('interface|tts|speak', { voice: 'espeak', lg: 'en', msg: 'Messages' });
			Flux.next('interface|tts|speak', messages);
			if (clearVoiceMailDelay) clearTimeout(clearVoiceMailDelay);
			clearVoiceMailDelay = setTimeout(function() {
				// Clearing VoiceMail
				clearVoiceMail();
			}, DELAY_TO_CLEAR_VOICEMAIL);
			log.info('VoiceMail will be cleared in 6 hours.');
			if (callback) callback(true); // for other action
			return true;
		} else {
			log.info(NO_VOICEMAIL);
			if (withTTSResult) Flux.next('interface|tts|speak', { lg: 'en', msg: NO_VOICEMAIL });
			if (callback) callback(false); // for other action
			return false;
		}
	});
}

/** Function to return number of voicemail message(s) */
function updateVoicemailMessage() {
	try {
		var messages = fs.readFileSync(VOICEMAIL_FILE, 'UTF-8');
		messages = JSON.parse(messages);
		Odi.run('voicemail', messages.length);
		if (Odi.run('voicemail') > 0) {
			Flux.next('interface|led|blink', { leds: ['belly'], speed: 200, loop: 2 }, { hidden: true });
		}
	} catch (e) {
		Odi.run('voicemail', 0);
	}
}

/** Function to clear all voicemail messages */
function clearVoiceMail() {
	fs.unlink(VOICEMAIL_FILE, function(err) {
		if (err) {
			if (err.code === 'ENOENT') log.info('clearVoiceMail : No message to delete !');
			else Odi.error(err);
		} else {
			updateVoicemailMessage();
			Flux.next('interface|tts|speak', { lg: 'en', msg: 'VoiceMail Cleared' });
		}
	});
}
