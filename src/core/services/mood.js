#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const Flux = require(Core._CORE + 'Flux.js');
const Utils = require(_PATH + 'src/core/Utils.js');
const RandomBox = require('randombox').RandomBox;

Flux.service.mood.subscribe({
	next: flux => {
		if (flux.id == 'expressive') {
			expressive(flux.value);
		} else if (flux.id == 'badBoy') {
			badBoy(flux.value);
		} else if (flux.id == 'java') {
			java(flux.value);
		} else Core.error('unmapped flux in Mood service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

function expressive(args) {
	console.log('expressive(args)');
}

// const MAX_JAVA = ['service|max|playOneMelody', 'service|max|playRdmMelody', 'service|max|hornRdm'];
var maxJavaRandomBox = new RandomBox(['service|max|playOneMelody', 'service|max|playRdmMelody', 'service|max|hornRdm']);

var ttsRandomBox = new RandomBox(Core.ttsMessages.random);
/** Function to start bad boy mode */
function java(interval) {
	log.INFO('JAVA mode !');
	Flux.next('interface|tts|speak', 'On va faire la java !');
	for (var i = 0; i < 20; i++) {
		// Flux.next('interface|tts|speak', Utils.randomItem(Core.ttsMessages.random));
		Flux.next('interface|tts|speak', ttsRandomBox.next());
	}

	setInterval(() => {
		let maxAction = maxJavaRandomBox.next();
		Flux.next(maxAction);
		Flux.next('service|interaction|exclamation');
	}, 1000);
}

/** Function to start bad boy mode */
function badBoy(interval) {
	if (typeof interval === 'number') {
		log.info('Bad Boy mode !! [' + interval + ']');
		Flux.next('interface|tts|speak', { lg: 'en', msg: 'Baad boy !' });
		var loop = 0;
		setInterval(function() {
			loop++;
			if (loop >= interval) {
				badBoyTTS();
				loop = 0;
			}
		}, 1000);
	} else {
		badBoyTTS();
	}
}

function badBoyTTS() {
	Flux.next('interface|tts|speak', getNewRdmBadBoyTTS());
	setTimeout(function() {
		Flux.next('interface|tts|speak', getNewRdmBadBoyTTS());
	}, 1000);
}

/** Function to select a different TTS each time */
const BAD_BOY_TTS_LENGTH = Core.ttsMessages.badBoy.length;
var rdmNb,
	lastRdmNb = [],
	rdmTTS = '';
function getNewRdmBadBoyTTS() {
	do {
		rdmNb = Utils.random(BAD_BOY_TTS_LENGTH);
		rdmTTS = Core.ttsMessages.badBoy[rdmNb];
		if (lastRdmNb.length >= BAD_BOY_TTS_LENGTH) lastRdmNb.shift();
	} while (lastRdmNb.indexOf(rdmNb) != -1);
	lastRdmNb.push(rdmNb);
	return rdmTTS;
}
