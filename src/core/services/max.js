#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	RandomBox = require('randombox').RandomBox;

module.exports = {
	api: {
		full: {
			POST: [
				{ url: 'max/blinkAllLed', flux: { id: 'service|max|blinkAllLed' } },
				{ url: 'max/blinkRdmLed', flux: { id: 'service|max|blinkRdmLed' } },
				{ url: 'max/playOneMelody', flux: { id: 'service|max|playOneMelody' } },
				{ url: 'max/playRdmMelody', flux: { id: 'service|max|playRdmMelody' } },
				{ url: 'max/hornRdm', flux: { id: 'service|max|hornRdm' } },
				{ url: 'max/turn', flux: { id: 'service|max|turn' } }
			]
		}
	}
};

Core.flux.service.max.subscribe({
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
		} else Core.error('unmapped flux in Max service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

var hornRandomBox;
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
// 	Core.do('interface|arduino|write', item, {delay:delay});
// 	delay = delay + 10;
// });

function blinkAllLed() {
	log.debug('blinkAllLed');
	Core.do('interface|arduino|write', 'blinkAllLed');
}

function blinkRdmLed() {
	log.debug('blinkRdmLed');
	Core.do('interface|arduino|write', 'blinkRdmLed');
}

function playOneMelody() {
	log.debug('playOneMelody');
	Core.do('interface|arduino|write', 'playOneMelody');
}

function playRdmMelody() {
	log.debug('playRdmMelody');
	Core.do('interface|arduino|write', 'playRdmMelody');
}

function turnNose() {
	log.debug('turnNose');
	Core.do('interface|arduino|write', 'turnNose');
}

var hornRandomBox = new RandomBox(HORNS);
function hornRdm() {
	// let horn = Utils.randomItem(HORNS);
	let horn = hornRandomBox.next();
	log.debug('hornRdm', horn);
	Core.do('interface|arduino|write', horn);
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
		// case 'hi_end':
		// 	maxCallbackTTS([{ lg: 'en', msg: 'Hi Max!' }, { lg: 'en', msg: 'Hey Max!' }]);
		// 	break;
		case 'some random action from Max':
			maxCallbackTTS(Core.ttsMessages.maxCallback.sensor);
			break;
		case 'blinkLed_end':
			if (Core.run('etat') == 'high') Core.do('interface|tts|speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playOneMelody_end':
		case 'playRdmMelody_end':
			maxCallbackTTS(Core.ttsMessages.maxCallback.melody);
			break;
		case 'turnNose_end':
			if (Core.run('etat') == 'high') Core.do('interface|tts|speak', { lg: 'en', msg: 'turn' });
			break;
		case 'playRdmHorn_end':
		case 'playHornDoUp_end':
		case 'playHorn_end':
		case 'playHornOff_end':
		case 'playHornWhistle_end':
		case 'playHornSiren_end':
		case 'playHornDown_end':
			maxCallbackTTS(Core.ttsMessages.maxCallback.horn);
			break;
		case 'playHornFire_end':
			maxCallbackTTS(Core.ttsMessages.maxCallback.hornFire);
			break;
		case 'playHornOvni_end':
			Core.do('interface|tts|speak', 'OVNI!');
			break;
		case 'playHornWarning_end':
		case 'playHornBombing_end':
			Core.do('interface|tts|speak', 'A couvert !');
			break;
		// escape tous les '...'
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

//const maxCallbackRandomBox = new RandomBox()// TODO to implement
function maxCallbackTTS(arg) {
	let maxCallbackTTS;
	if (Array.isArray(arg)) {
		maxCallbackTTS = Utils.randomItem(arg);
		Core.do('interface|tts|speak', maxCallbackTTS);
	} else if (typeof arg == 'string') {
		Core.do('interface|tts|speak', arg);
	} else {
		log.error('maxCallbackTTS: wrong arg [' + typeof arg + ']', arg);
	}
}

// list of commands:
//blinkAllLed();
// Core.do('interface|arduino|write', 'hi', { delay: 3 });
// Core.do('service|max|blinkAllLed', null, { delay: 6 });
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
