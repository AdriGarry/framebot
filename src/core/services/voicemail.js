#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

const fs = require('fs');

Core.flux.service.voicemail.subscribe({
	next: flux => {
		if (flux.id == 'new') {
			addVoiceMailMessage(flux.value);
		} else if (flux.id == 'check') {
			checkVoiceMail(flux.value);
		} else if (flux.id == 'clear') {
			clearVoiceMail();
		} else Core.error('unmapped flux in Voicemail service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

const DELAY_TO_CLEAR_VOICEMAIL = 60 * 60 * 1000; //15*60*1000;
const VOICEMAIL_FILE = Core._TMP + 'voicemail.json';
const VOICEMAIL_FILE_HISTORY = Core._LOG + Core.name + '_voicemailHistory.json';

setImmediate(() => {
	updateVoicemailMessage();
	log.info('VoiceMail flag initialized');
	if (!Core.run('alarm')) {
		checkVoiceMail();
	}
});
setInterval(function() {
	updateVoicemailMessage();
}, 10000);

/** Function to persist voicemail message */
function addVoiceMailMessage(tts) {
	log.info('New voicemail message :', tts);
	if (typeof tts === 'object' && tts.hasOwnProperty('msg') && typeof tts.msg === 'string') {
		tts.timestamp = Utils.logTime('D/M h:m:s', new Date());
		Utils.appendJsonFile(VOICEMAIL_FILE, tts);
		Utils.appendJsonFile(VOICEMAIL_FILE_HISTORY, tts);
		setTimeout(function() {
			updateVoicemailMessage();
		}, 1000);
		// try {
		// 	console.log(tts.msg);
		// 	let newTTS = JSON.parse(tts.msg);
		// 	console.log(newTTS);
		// 	addVoiceMailMessage(newTTS);
		// 	return;
		// } catch (err) {
		// 	log.INFO('--->this is not a real error', err, tts);
		// }
	} else if (Array.isArray(tts)) {
		// log.INFO('______array message');
		for (var i = 0; i < tts.length; i++) {
			addVoiceMailMessage(tts[i]);
		}
	} else {
		Core.error("Wrong tts, can't save voicemail", tts);
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
			Core.do('interface|tts|speak', { voice: 'espeak', lg: 'en', msg: 'Messages' });
			Core.do('interface|tts|speak', messages);
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
			if (withTTSResult) Core.do('interface|tts|speak', { lg: 'en', msg: NO_VOICEMAIL });
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
		Core.run('voicemail', messages.length);
		if (Core.run('voicemail') > 0) {
			Core.do('interface|led|blink', { leds: ['belly'], speed: 200, loop: 2 }, { hidden: true });
		}
	} catch (e) {
		Core.run('voicemail', 0);
	}
}

/** Function to clear all voicemail messages */
function clearVoiceMail() {
	fs.unlink(VOICEMAIL_FILE, function(err) {
		if (err) {
			if (err.code === 'ENOENT') log.info('clearVoiceMail : No message to delete !');
			else Core.error(err);
		} else {
			updateVoicemailMessage();
			Core.do('interface|tts|speak', { lg: 'en', msg: 'VoiceMail Cleared' });
		}
	});
}
