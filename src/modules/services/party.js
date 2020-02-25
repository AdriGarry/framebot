#!/usr/bin/env node

// Module Party

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

module.exports = {};

Core.flux.service.party.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			start();
		} else if (flux.id == 'birthdaySong') {
			birthdaySong();
		} else if (flux.id == 'tts') {
			partyTTS();
		} else if (flux.id == 'pirate') {
			pirate(flux.value);
		} else Core.error('unmapped flux in Party service', flux);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function birthdaySong() {
	log.info('birthday song...');
	Core.do('interface|sound|play', { mp3: 'system/birthday.mp3' });
}

function start() {
	log.INFO("Let's start the party !!  <|:-)");
	Core.do('interface|tts|speak', { voice: 'google', lg: 'en', msg: "Let's start the party" });
	Core.run('mood', 'party');
	firePartyActionAndRandom();
}

function firePartyActionAndRandom() {
	let nextActionTimeout = Utils.random(2, 10) * 30;
	log.debug('firePartyActionAndRandom(). next action=', nextActionTimeout);
	setTimeout(function() {
		log.info('firing next party action...');
		let rdmAction = Utils.random(7);
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

function pirate(mode) {
	log.info('pirate(mode)', mode);
	let tts;
	if (mode == 'full') {
		let msg1 = { msg: 'Pirate un appelle pirate 2 !' };
		let msg2 = { voice: 'google', msg: 'Pourquoi pirate 2 ?' };
		let msg3 = { msg: 'Combien sinon ?' };
		let msg4 = { voice: 'google', msg: 'Pirate ' + Utils.random(3, 7) };
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
