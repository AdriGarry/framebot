#!/usr/bin/env node

// Module Party

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const Utils = require(_PATH + 'src/core/Utils.js');
// const Flux = require(Core._CORE + 'Flux.js');
const spawn = require('child_process').spawn;

Core.flux.service.party.subscribe({
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
		Core.error(flux);
	}
});

function start() {
	log.INFO("Let's start the party !!  <|:-)");
	Core.do('interface|tts|speak', { voice: 'google', lg: 'en', msg: "Let's start the party" });
	Core.run('mood', 'party');
	log.table(Core.run(), 'RUNTIME...');
	firePartyActionAndRandom();
}

var lastRdmNb;
function firePartyActionAndRandom() {
	var nextActionTimeout = Utils.random(2, 10) * 30; //2, 10
	log.debug('firePartyActionAndRandom(). next action=', nextActionTimeout);
	setTimeout(function() {
		log.info('firing next party action...');
		var rdmAction = Utils.random(7);
		switch (rdmAction) {
			case 0:
				pirate();
				break;
			case 1:
				pirate('full');
				break;
			case (2, 3, 4):
				Core.do('interface|tts|random');
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
	Core.do('interface|tts|speak', tts);
}

function partyTTS() {
	log.debug('partyTTS()');
	Core.do('interface|tts|speak', getNewRdmPartyTTS());
}

/** Function to select a different TTS each time */
const PARTY_TTS_LENGTH = Core.ttsMessages.party.length;
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
	return Core.ttsMessages.party[rdmNb];
}
