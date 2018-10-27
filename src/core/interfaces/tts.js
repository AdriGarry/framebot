#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	VOICES = {
		espeak: require(Core._CORE + 'interfaces/tts/espeak.js'),
		google: require(Core._CORE + 'interfaces/tts/google.js'),
		pico: require(Core._CORE + 'interfaces/tts/pico.js')
	};

Core.flux.interface.tts.subscribe({
	next: flux => {
		if (flux.id == 'speak') {
			speak(flux.value);
		} else if (flux.id == 'pico') {
			pico(flux.value);
		} else if (flux.id == 'lastTTS') {
			lastTTS();
		} else if (flux.id == 'random') {
			speak();
		} else if (flux.id == 'clearTTSQueue') {
			clearTTSQueue();
		} else Core.error('unmapped flux in TTS module', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

var onAir = false,
	ttsQueue = [],
	lastTtsMsg = { voice: 'espeak', lg: 'en', msg: '.undefined' };

/** Function to add TTS message in queue and proceed */
function speak(tts) {
	// log.debug(tts);
	if (Array.isArray(tts)) {
		log.info('TTS array object... processing'); // , tts
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
			var ttsQueueLength = ttsQueue.length;
			ttsQueue.push(tts);
			log.debug('new TTS [' + (tts.lg || '') + ', ' + (tts.voice || '') + '] "' + tts.msg + '"');
		} else log.debug(console.error('newTTS() Wrong TTS object ', tts));
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
	// console.log('new TTS [' + (tts.lg || '') + ', ' + (tts.voice || '') + '] "' + tts.msg + '"');
}

/** Function to play TTS message (espeak / google translate) */
const VOICE_LIST = ['google', 'espeak'];
const LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];
var playTTS = function(tts) {
	Core.do('service|max|blinkRdmLed');
	// TEST IF INTERNET CONNEXION
	if (!tts.hasOwnProperty('voice') || !VOICE_LIST.indexOf(tts.voice) == -1) {
		// Random voice if undefined
		tts.voice = 'espeak';
		/*ODI.utils.testConnexion(function(connexion){
			if(connexion == true){
			}else{
			}
		});*/
	}
	if (!tts.hasOwnProperty('lg') || !LG_LIST.indexOf(tts.lg) == -1) {
		// Fr language if undefined
		tts.lg = 'fr';
	}
	log.info('play TTS [' + tts.voice + ', ' + tts.lg + '] "' + tts.msg + '"');
	tts.msg = tts.msg.replace('%20', '');
	VOICES[tts.voice].speak(tts);

	Core.do(
		'interface|led|blink',
		{ leds: ['eye'], speed: Utils.random(50, 150), loop: tts.msg.length / 2 + 2 },
		{ hidden: true }
	);
	log.debug('tts.msg.length :', tts.msg.length);

	lastTtsMsg = tts;
};

/** Function to clear TTS Queue */
function clearTTSQueue() {
	ttsQueue = [];
}

/** Function last TTS message */
function lastTTS() {
	log.info('LastTTS ->', lastTtsMsg);
	speak(lastTtsMsg);
}
