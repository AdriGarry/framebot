#!/usr/bin/env node
'use strict';

const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	api: {
		full: {
			POST: [
				{ url: 'checkVoicemail', flux: { id: 'service|voicemail|check' } },
				{ url: 'clearVoicemail', flux: { id: 'service|voicemail|clear' } }
			]
		}
	}
};

Core.flux.service.voicemail.subscribe({
	next: flux => {
		if (flux.id == 'new') {
			addVoicemailMessage(flux.value);
		} else if (flux.id == 'check') {
			checkVoicemail(flux.value);
		} else if (flux.id == 'clear') {
			clearVoicemail();
		} else Core.error('unmapped flux in Voicemail service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

const NO_VOICEMAIL = 'No voicemail message',
	VOICEMAIL_FILE = Core._TMP + 'voicemail.json',
	VOICEMAIL_FILE_HISTORY = Core._LOG + Core.name + '_voicemailHistory.json',
	HOURS_TO_CLEAR_VOICEMAIL = 6;

var clearVoicemailDelay;

setImmediate(() => {
	updateVoicemailMessage();
	log.info('Voicemail flag initialized');
	if (!Core.run('alarm')) {
		checkVoicemail();
	}
});
setInterval(function() {
	updateVoicemailMessage();
}, 10000);

/** Function to persist voicemail message */
function addVoicemailMessage(tts) {
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
		// 	addVoicemailMessage(newTTS);
		// 	return;
		// } catch (err) {
		// 	log.INFO('--->this is not a real error', err, tts);
		// }
	} else if (typeof tts === 'string') {
		addVoicemailMessage({ msg: tts });
	} else if (Array.isArray(tts)) {
		for (var i = 0; i < tts.length; i++) {
			addVoicemailMessage(tts[i]);
		}
	} else {
		Core.error("Wrong tts, can't save voicemail", tts);
		return;
	}
}

/** Function to check voicemail, and play */
function checkVoicemail(withTTSResult) {
	log.debug('Checking voicemail...');
	Utils.getJsonFileContent(VOICEMAIL_FILE)
		.then(data => {
			if (data) {
				let messages = JSON.parse(data);
				log.debug(messages);
				Core.do('interface|tts|speak', { voice: 'google', lg: 'en', msg: 'Messages' });
				Core.do('interface|tts|speak', messages);
				clearVoicemailLater();
			} else {
				log.info(NO_VOICEMAIL);
				if (withTTSResult) Core.do('interface|tts|speak', { lg: 'en', msg: NO_VOICEMAIL });
			}
		})
		.catch(err => {
			Core.error('checkVoicemail error', err);
		});
}

/** Function to update runtime with number of voicemail message(s) */
function updateVoicemailMessage() {
	try {
		let messages = fs.readFileSync(VOICEMAIL_FILE, 'UTF-8');
		messages = JSON.parse(messages);
		Core.run('voicemail', messages.length);
		if (Core.run('voicemail') > 0) {
			Core.do('interface|led|blink', { leds: ['belly'], speed: 200, loop: 1 }, { log: 'trace' });
		}
	} catch (e) {
		Core.run('voicemail', 0);
	}
}

/** Function to schedule voicemail deletion */
function clearVoicemailLater() {
	log.info('clearVoicemail');
	if (clearVoicemailDelay) {
		clearTimeout(clearVoicemailDelay);
		clearVoicemailDelay = null;
	}
	clearVoicemailDelay = setTimeout(function() {
		clearVoicemail();
	}, HOURS_TO_CLEAR_VOICEMAIL * 60 * 60 * 1000);
	log.info('Voicemail will be cleared in ' + HOURS_TO_CLEAR_VOICEMAIL + ' hours');
}

/** Function to clear all voicemail messages */
function clearVoicemail() {
	log.info('clearVoicemail');
	fs.unlink(VOICEMAIL_FILE, function(err) {
		if (err) {
			if (err.code === 'ENOENT') log.info('clearVoicemail : No message to delete!');
			else Core.error(err);
		} else {
			updateVoicemailMessage();
			Core.do('interface|tts|speak', { lg: 'en', msg: 'Voicemail Cleared' });
		}
	});
}