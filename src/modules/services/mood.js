#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	Observers = require(Core._CORE + 'Observers.js');

const log = new (require(Core._API + 'Logger.js'))(__filename),
	Flux = require(Core._API + 'Flux.js'),
	{ Utils } = require(Core._API + 'api.js'),
	RandomBox = require('randombox').RandomBox;

Observers.service().mood.subscribe({
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
		Core.error('Flux error', err);
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
	Core.run('mood', 'java');
	log.INFO('JAVA mode !');
	new Flux('interface|tts|speak', 'On va faire la java !');
	for (let i = 0; i < 20; i++) {
		// new Flux('interface|tts|speak', Utils.randomItem(Core.ttsMessages.random));
		new Flux('interface|tts|speak', ttsRandomBox.next());
	}

	setInterval(() => {
		let maxAction = maxJavaRandomBox.next();
		new Flux(maxAction);
		new Flux('service|interaction|exclamation');
	}, 1000);
}

/** Function to start bad boy mode */
function badBoy(interval) {
	if (typeof interval === 'number') {
		Core.run('mood', 'badBoy');
		log.info('Bad Boy mode !! [' + interval + ']');
		new Flux('interface|tts|speak', { lg: 'en', msg: 'Baad boy !' });
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
	new Flux('interface|tts|speak', getNewRdmBadBoyTTS());
	setTimeout(function() {
		new Flux('interface|tts|speak', getNewRdmBadBoyTTS());
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
