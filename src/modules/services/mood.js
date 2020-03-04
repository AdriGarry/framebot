#!/usr/bin/env node
'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const RandomBox = require('randombox').RandomBox;

const FLUX_PARSE_OPTIONS = [
	{ id: 'expressive', fn: expressive },
	{ id: 'badBoy', fn: badBoy },
	{ id: 'java', fn: java }
];

Observers.attachFluxParseOptions('service', 'mood', FLUX_PARSE_OPTIONS);

function expressive(args) {
	log.test('expressive(args)', args);
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
