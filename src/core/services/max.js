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
	log.info('Max data:', data);
	switch (data) {
		case 'blinkLed':
			if (Odi.run('etat') == 'high') Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playOneMelodyEnd':
		case 'playRandomMelodyEnd':
			if (Utils.random()) {
				Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'contact' });
			} else {
				Flux.next('module', 'tts', 'speak', 'mais oui    Max');
			}
			break;
		case 'turnEnd':
			if (Odi.run('etat') == 'high') Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'turn' });
			break;
		case 'playRdmHornEnd':
			if (Utils.random()) {
				Flux.next('module', 'tts', 'speak', 'eh ho, sa suffit!');
			} else {
				Flux.next('module', 'tts', 'speak', 'doucement avec ton tweeter!');
			}
			break;
		default:
			log.info('unmapped Max data:', data);
			break;
	}
	//log.INFO('Set action or TTS here...');
}
