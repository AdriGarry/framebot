#!/usr/bin/env node

// Module Party

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;

Flux.service.party.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			start(flux.value);
		} else if (flux.id == 'tts') {
			partyTTS(flux.value);
		} else if (flux.id == 'pirate') {
			pirate(flux.value);
		} else {
			log.info('Party flux not mapped', flux);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

function start() {
	log.INFO("Let's start the party !!  <|:-)");
	Flux.next('interface', 'tts', 'speak', { voice: 'google', lg: 'en', msg: "Let's start the party" });
	Odi.run('mood', 'party');
	log.table(Odi.run(), 'RUNTIME...');
	firePartyActionAndRandom();
}

var lastRdmNb;
function firePartyActionAndRandom() {
	var nextActionTimeout = Utils.random(2, 10) * 30; //2, 10
	log.debug('firePartyActionAndRandom(). next action=', nextActionTimeout);
	//console.log('firePartyActionAndRandom(). next action=', nextActionTimeout);
	setTimeout(function() {
		log.info('firing next party action...');
		var rdmAction = Utils.random(11);
		switch (rdmAction) {
			case 0:
				pirate();
				break;
			case 1:
				pirate('full');
				break;
			case (2, 3):
				Flux.next('service', 'mood', 'badBoy');
				break;
			case (4, 5, 6):
				Flux.next('interface', 'tts', 'random');
				break;
			default:
				partyTTS();
				break;
		}
		firePartyActionAndRandom();
	}, nextActionTimeout * 1000);
}

/** Function jukebox [mode: 'full'] */
function pirate(mode) {
	log.info('pirate(mode)', mode);
	var tts;
	if (mode == 'full') {
		var msg1 = { msg: 'Pirate un appelle pirate 2 !' };
		var msg2 = { voice: 'google', msg: 'Pourquoi pirate 2 ?' };
		var msg3 = { msg: 'Combien sinon ?' };
		var msg4 = { voice: 'google', msg: 'Pirate ' + Utils.random(3, 7) };
		tts = [msg1, msg2, msg3, msg4];
	} else {
		tts = { msg: 'Pirate ' + Utils.random(1, 3) + ' appelle pirate ' + Utils.random(4, 6) + ' !' };
	}
	Flux.next('interface', 'tts', 'speak', tts);
}

function partyTTS() {
	log.debug('partyTTS()');
	Flux.next('interface', 'tts', 'speak', getNewRdmPartyTTS());
}

/** Function to select a different TTS each time */
const PARTY_TTS_LENGTH = Odi.ttsMessages.party.length;
var rdmNb,
	lastRdmNb = [],
	rdmTTS = '';
function getNewRdmPartyTTS() {
	if (lastRdmNb.length == PARTY_TTS_LENGTH) {
		lastRdmNb = [];
	}
	rdmNb = Utils.random(PARTY_TTS_LENGTH);
	if (lastRdmNb.indexOf(rdmNb) > -1) {
		return getNewRdmPartyTTS();
	}
	lastRdmNb.push(rdmNb);
	return Odi.ttsMessages.party[rdmNb];
}
