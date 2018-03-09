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
	log.info('blinkAllLed');
	Flux.next('interface|arduino|write', 'blinkAllLed');
}

function playOneMelody() {
	log.info('playOneMelody');
	Flux.next('interface|arduino|write', 'playOneMelody');
}

function turnNose() {
	log.info('turnNose');
	Flux.next('interface|arduino|write', 'turnNose');
}

function hornRdm() {
	let horn = Utils.randomItem(HORNS);
	log.info('hornRdm', horn);
	Flux.next('interface|arduino|write', horn);
}

function parseDataFromMax(data) {
	if (typeof data == 'string' && data.indexOf('...') == -1) {
		data.substring(0, data.length - 3);
		log.info('Max data:', data);
	}
	console.log('----', data);
	switch (data) {
		case 'some random action from Max':
			if (Odi.isAwake()) Flux.next('interface|tts|speak', 'Oh, il se passe un truc du coter de chez Max!');
			break;
		case 'blinkLed':
			if (Odi.run('etat') == 'high') Flux.next('interface|tts|speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playOneMelodyEnd':
		case 'playRandomMelodyEnd':
			let maxCallbackTTS = Utils.randomItem(Odi.ttsMessages.maxCallback);
			Flux.next('interface|tts|speak', maxCallbackTTS);
			break;
		case 'turnEnd':
			if (Odi.run('etat') == 'high') Flux.next('interface|tts|speak', { lg: 'en', msg: 'turn' });
			break;
		case 'playRdmHornEnd':
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
	//log.INFO('Set action or TTS here...');
}
