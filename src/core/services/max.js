#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(Odi._CORE + 'Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');

Flux.service.max.subscribe({
	next: flux => {
		if (flux.id == 'parse') {
			parseDataFromMax(flux.value);
		} else if (flux.id == 'blinkAllLed') {
			blinkAllLed();
		} else if (flux.id == 'blinkRdmLed') {
			blinkRdmLed();
		} else if (flux.id == 'playOneMelody') {
			playOneMelody();
		} else if (flux.id == 'playRdmMelody') {
			playRdmMelody();
		} else if (flux.id == 'hornRdm') {
			hornRdm();
		} else if (flux.id == 'turn') {
			turnNose();
		} else Odi.error('unmapped flux in Max service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

//blinkAllLed();
// Flux.next('interface|arduino|write', 'hi', { delay: 3 });
// Flux.next('service|max|blinkAllLed', null, { delay: 6 });

// playRdmHorn
// playHornWarning();
// playHornDoUp(random(1, 8));
// playHorn();
// playHornOff();
// playHornFire(random(1, 5));
// playHornWhistle();
// playHornOvni();
// playHornBombing(random(1, 5));
// playHornSiren(random(3, 7));
// playHornDown();
const HORNS = [
	'playHornWarning',
	'playHornDoUp',
	'playHorn',
	'playHornOff',
	'playHornFire',
	'playHornWhistle',
	'playHornOvni',
	'playHornBombing',
	'playHornSiren',
	'playHornDown'
];

// let delay = 10;
// HORNS.forEach(item => {
// 	Flux.next('interface|arduino|write', item, {delay:delay});
// 	delay = delay + 10;
// });

function blinkAllLed() {
	log.debug('blinkAllLed');
	Flux.next('interface|arduino|write', 'blinkAllLed');
}

function blinkRdmLed() {
	log.debug('blinkRdmLed');
	Flux.next('interface|arduino|write', 'blinkRdmLed');
}

function playOneMelody() {
	log.debug('playOneMelody');
	Flux.next('interface|arduino|write', 'playOneMelody');
}

function playRdmMelody() {
	log.debug('playRdmMelody');
	Flux.next('interface|arduino|write', 'playRdmMelody');
}

function turnNose() {
	log.debug('turnNose');
	Flux.next('interface|arduino|write', 'turnNose');
}

function hornRdm() {
	let horn = Utils.randomItem(HORNS);
	log.debug('hornRdm', horn);
	Flux.next('interface|arduino|write', horn);
}

function parseDataFromMax(data) {
	log.info('Max data:', data);
	data = String(data).trim();
	// \n+.
	maxCallbackAction(data);
}

function maxCallbackAction(data) {
	log.debug('maxCallbackAction()', data);
	switch (data) {
		case 'hi_end':
			maxCallbackTTS([{ lg: 'en', msg: 'Hi Max!' }, { lg: 'en', msg: 'Hey Max!' }]);
			break;
		case 'some random action from Max':
			maxCallbackTTS([
				'Oh, il se passe un truc du coter de chez Max!',
				'Max sensor',
				{ lg: 'en', msg: 'Max sensor fired' }
			]);
			break;
		case 'blinkLed_end':
			if (Odi.run('etat') == 'high') Flux.next('interface|tts|speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playOneMelody_end':
		case 'playRdmMelody_end':
			maxCallbackTTS(Odi.ttsMessages.maxCallback);
			break;
		case 'turnNose_end':
			if (Odi.run('etat') == 'high') Flux.next('interface|tts|speak', { lg: 'en', msg: 'turn' });
			break;
		case 'playRdmHorn_end':
		case 'playHornDoUp_end':
		case 'playHorn_end':
		case 'playHornOff_end':
		case 'playHornWhistle_end':
		case 'playHornSiren_end':
		case 'playHornDown_end':
			maxCallbackTTS(['eh ho, sa suffit!', 'doucement avec ton tweeter!']);
			break;
		case 'playHornFire_end':
			maxCallbackTTS("Je crois qu'il y a le feu !");
			break;
		case 'playHornOvni_end':
			Flux.next('interface|tts|speak', 'Contact extra terrestre !');
			break;
		case 'playHornWarning_end':
		case 'playHornBombing_end':
			Flux.next('interface|tts|speak', 'A couvert !');
			break;
		case 'Max initialization...':
		case 'playMelody...':
		case 'Max ready':
			// escaping Max initialization
			break;
		default:
			log.info('unmapped Max data:', data);
			break;
	}
}

function maxCallbackTTS(arg) {
	let maxCallbackTTS;
	if (Array.isArray(arg)) {
		maxCallbackTTS = Utils.randomItem(arg);
		Flux.next('interface|tts|speak', maxCallbackTTS);
	} else if (typeof arg == 'string') {
		Flux.next('interface|tts|speak', arg);
	} else {
		log.error('maxCallbackTTS: wrong arg [' + typeof arg + ']', arg);
	}
}
