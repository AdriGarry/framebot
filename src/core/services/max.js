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

blinkAllLed();

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
	switch (data) {
		case 'some random action from Max':
			if (Odi.isAwake()) Flux.next('interface|tts|speak', 'Oh, il se passe un truc du coter de chez Max!');
			break;
		case 'blinkLed_end':
			if (Odi.run('etat') == 'high') Flux.next('interface|tts|speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playOneMelody_end':
		case 'playRandomMelody_end':
			let maxCallbackTTS = Utils.randomItem(Odi.ttsMessages.maxCallback);
			Flux.next('interface|tts|speak', maxCallbackTTS);
			break;
		case 'turn_end':
			if (Odi.run('etat') == 'high') Flux.next('interface|tts|speak', { lg: 'en', msg: 'turn' });
			break;
		case 'playRdmHorn_end':
			if (Utils.rdm()) {
				Flux.next('interface|tts|speak', 'eh ho, sa suffit!');
			} else {
				Flux.next('interface|tts|speak', 'doucement avec ton tweeter!');
			}
			break;
		default:
			log.debug('unmapped Max data:', data);
			break;
	}
}
