#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

Flux.service.max.subscribe({
	next: flux => {
		if (flux.id == 'parse') {
			parseDataFromMax(flux.value);
		} else Odi.error('unmapped flux in Max service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

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

function parseDataFromMax(data) {
	if (data.indexOf('...') == -1) {
		log.info('Max data:', data);
		// } else {
		// 	return;
	}
	switch (data) {
		case 'some random action from Max':
			if (Odi.isAwake()) Flux.next('interface', 'tts', 'speak', 'Oh, il se passe un truc du coter de chez Max!');
			break;
		case 'blinkLed':
			if (Odi.run('etat') == 'high') Flux.next('interface', 'tts', 'speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playOneMelodyEnd':
		case 'playRandomMelodyEnd':
			if (Utils.rdm()) {
				Flux.next('interface', 'tts', 'speak', { lg: 'en', msg: 'contact' });
			} else {
				Flux.next('interface', 'tts', 'speak', 'mais oui    Max');
			}
			break;
		case 'turnEnd':
			if (Odi.run('etat') == 'high') Flux.next('interface', 'tts', 'speak', { lg: 'en', msg: 'turn' });
			break;
		case 'playRdmHornEnd':
			if (Utils.rdm()) {
				Flux.next('interface', 'tts', 'speak', 'eh ho, sa suffit!');
			} else {
				Flux.next('interface', 'tts', 'speak', 'doucement avec ton tweeter!');
			}
			break;
		default:
			log.debug('unmapped Max data:', data);
			break;
	}
	//log.INFO('Set action or TTS here...');
}

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
// 	Flux.next('interface', 'arduino', 'write', item, delay);
// 	delay = delay + 10;
// });
