#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	voices = require(Core._MODULES + 'interfaces/tts/voices.js');

const VOICE_LIST = Object.keys(voices);
const LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];

module.exports = {};

Core.flux.interface.tts.subscribe({
	next: flux => {
		if (flux.id == 'speak') {
			speak(flux.value);
		} else if (flux.id == 'lastTTS') {
			lastTTS();
		} else if (flux.id == 'random') {
			speak();
		} else if (flux.id == 'clearTTSQueue') {
			clearTTSQueue();
		} else Core.error('unmapped flux in TTS module', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

var onAir = false,
	ttsQueue = [],
	lastTtsMsg = { voice: 'espeak', lg: 'en', msg: '.undefined' };

/** Function to add TTS message in queue and proceed */
function speak(tts) {
	// log.debug(tts);
	if (Array.isArray(tts)) {
		log.info('TTS array object... processing');
		tts.forEach(function(message) {
			if (typeof message === 'string' || message.hasOwnProperty('msg')) {
				speak(message);
			}
		});
	} else if (typeof tts === 'string') {
		ttsQueue.push({ msg: tts });
	} else if (!tts || !Object.keys(tts).length > 0 || tts.msg.toUpperCase().indexOf('RANDOM') > -1) {
		// OR UNDEFINED !!
		randomTTS();
	} else {
		if (tts.hasOwnProperty('msg')) {
			ttsQueue.push(tts);
			log.debug('new TTS [' + (tts.voice || '') + ', ' + (tts.lg || '') + '] "' + tts.msg + '"');
		} else log.debug(console.error('newTTS() Wrong TTS object // TODO something...', tts));
	}
	if (ttsQueue.length > 0) proceedQueue();
}

/** Function to proceed TTS queue */
var queueInterval,
	currentTTS,
	timeout = 0;
function proceedQueue() {
	log.debug('Start processing TTS queue...');
	queueInterval = setInterval(function() {
		if (!onAir && ttsQueue.length > 0) {
			onAir = true;
			currentTTS = ttsQueue.shift();
			playTTS(currentTTS);
			if (currentTTS.voice === 'google') timeout = currentTTS.msg.length * 90 + 1500;
			else timeout = currentTTS.msg.length * 80 + 1500;
			setTimeout(function() {
				onAir = false;
			}, timeout);
			if (ttsQueue.length === 0) {
				log.debug('No more TTS, stop processing TTS queue!');
				clearInterval(queueInterval);
			}
		}
	}, 500);
}

/** Function to launch random TTS */
const RANDOM_TTS_LENGTH = Core.ttsMessages.random.length;
function randomTTS() {
	var rdmNb = Utils.random(RANDOM_TTS_LENGTH);
	log.info('tts.js> rdmNb: ', rdmNb);
	var rdmTTS = Core.ttsMessages.random[rdmNb];
	log.info('Random TTS : ' + rdmNb + '/' + RANDOM_TTS_LENGTH);
	speak(rdmTTS);
}

/** Function to play TTS message (espeak / google translate) */
function playTTS(tts) {
	Core.do('service|max|blinkRdmLed');
	// TODO test if internet connexion?
	if (!tts.hasOwnProperty('voice') || !VOICE_LIST.indexOf(tts.voice) == -1) {
		log.debug('No valid voice, fallback on espeak');
		tts.voice = 'espeak';
	}
	if (!tts.hasOwnProperty('lg') || !LG_LIST.indexOf(tts.lg) == -1) {
		log.debug('No valid language, fallback on Fr');
		tts.lg = 'fr';
	}

	if (tts.voice === 'espeak') tts.voice = Utils.randomItem(['espeak', 'mbrola1', 'mbrola4']);

	log.info('play TTS [' + tts.voice + ', ' + tts.lg + '] "' + tts.msg + '"');
	tts.msg = tts.msg.replace('%20', '');

	voices[tts.voice](tts);

	Core.do(
		'interface|led|blink',
		{ leds: ['eye'], speed: Utils.random(50, 150), loop: tts.msg.length / 2 + 2 },
		{ log: 'trace' }
	);

	lastTtsMsg = tts;
}

/** Function to clear TTS Queue */
function clearTTSQueue() {
	ttsQueue = [];
}

/** Function last TTS message */
function lastTTS() {
	log.info('LastTTS ->', lastTtsMsg);
	speak(lastTtsMsg);
}
