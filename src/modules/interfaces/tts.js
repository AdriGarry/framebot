#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const TTS = require(__dirname + '/tts/TTS.js');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	voices = require(Core._MODULES + 'interfaces/tts/voices.js'),
	RandomBox = require('randombox').RandomBox;

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
	if (Array.isArray(tts)) {
		log.info('TTS array object... processing');
		tts.forEach(function(message) {
			if (typeof message === 'string' || message.hasOwnProperty('msg')) {
				speak(message);
			}
		});
	} else if (typeof tts === 'string') {
		ttsQueue.push(new TTS(tts));
	} else if (!tts || !Object.keys(tts).length > 0 || tts.msg.toUpperCase().indexOf('RANDOM') > -1) {
		randomTTS();
	} else {
		if (tts.hasOwnProperty('msg')) {
			ttsQueue.push(new TTS(tts.msg, tts.lg, tts.voice));
			log.debug('new TTS [' + (tts.voice || '') + ', ' + (tts.lg || '') + '] "' + tts.msg + '"');
		} else log.debug(console.error('newTTS() Wrong TTS object...', tts));
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
				log.trace('No more TTS, stop processing TTS queue!');
				clearInterval(queueInterval);
			}
		}
	}, 500);
}

/** Function to play TTS message (espeak / google translate) */
function playTTS(tts) {
	Core.do('service|max|blinkRdmLed');
	// TODO test if internet connexion?

	log.info(tts.toString());
	tts.setMsgReplaced();
	voices[tts.voice](tts);

	let blinkDuration = tts.getMsg().length / 2 + 2,
		speed = Utils.random(50, 150);
	Core.do('interface|led|blink', { leds: ['eye'], speed: speed, loop: blinkDuration }, { log: 'trace' });

	lastTtsMsg = tts;
}

/** Function last TTS message */
function lastTTS() {
	log.info('LastTTS ->', lastTtsMsg);
	speak(lastTtsMsg);
}

/** Function to launch random TTS */
const TTS_RANDOMBOX = new RandomBox(Core.ttsMessages.random);
function randomTTS() {
	let rdmTTS = TTS_RANDOMBOX.next();
	log.info('Random TTS : ', rdmTTS);
	speak(rdmTTS);
}

/** Function to clear TTS Queue */
function clearTTSQueue() {
	ttsQueue = [];
}
