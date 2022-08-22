#!/usr/bin/env node

// Module Party

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const RandomBox = require('randombox').RandomBox;

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'start', fn: start },
  { id: 'birthdaySong', fn: birthdaySong },
  { id: 'tts', fn: partyTTS },
  { id: 'pirate', fn: pirate },
  { id: 'badBoy', fn: badBoy },
  { id: 'java', fn: java }
];

Observers.attachFluxParseOptions('service', 'party', FLUX_PARSE_OPTIONS);

function birthdaySong() {
  log.info('birthday song...');
  new Flux('interface|sound|play', { file: 'system/birthday.mp3' });
}

function start() {
  log.INFO("Let's start the party !!  <|:-)");
  new Flux('interface|tts|speak', { voice: 'google', lg: 'en', msg: "Let's start the party" });
  firePartyActionAndRandom();
}

function firePartyActionAndRandom() {
  let nextActionTimeout = Utils.random(2, 10) * 30;
  log.debug('firePartyActionAndRandom(). next action=', nextActionTimeout);
  setTimeout(function () {
    log.info('firing next party action...');
    let rdmAction = Utils.random(7);
    switch (rdmAction) {
      case 0:
        pirate();
        break;
      case 1:
        pirate('full');
        break;
      case 2:
      case 3:
      case 4:
        new Flux('interface|tts|random');
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
  new Flux('interface|tts|speak', tts);
}

function partyTTS() {
  log.debug('partyTTS()');
  new Flux('interface|tts|speak', getNewRdmPartyTTS());
}

/** Function to select a different TTS each time */
const PARTY_TTS_LENGTH = Core.ttsMessages.party.length;
let rdmNbParty,
  lastRdmNbParty = [];
function getNewRdmPartyTTS() {
  if (lastRdmNbParty.length == PARTY_TTS_LENGTH) {
    lastRdmNbParty = [];
  }
  rdmNbParty = Utils.random(PARTY_TTS_LENGTH);
  if (lastRdmNbParty.indexOf(rdmNbParty) > -1) {
    return getNewRdmPartyTTS();
  }
  lastRdmNbParty.push(rdmNbParty);
  return Core.ttsMessages.party[rdmNbParty];
}

let maxJavaRandomBox = new RandomBox(['service|max|playOneMelody', 'service|max|playRdmMelody', 'service|max|hornRdm']);

let ttsRandomBox = new RandomBox(Core.ttsMessages.random);
/** Function to start bad boy mode */
function java(interval) {
  log.INFO('JAVA mode !');
  new Flux('interface|tts|speak', 'On va faire la java !');
  for (let i = 0; i < 20; i++) {
    new Flux('interface|tts|speak', ttsRandomBox.next());
  }

  setInterval(() => {
    let maxAction = maxJavaRandomBox.next();
    new Flux(maxAction);
    new Flux('service|interaction|exclamation');
  }, 3000);
}

/** Function to start bad boy mode */
function badBoy(interval) {
  if (typeof interval === 'number') {
    log.info('Bad Boy mode !! [' + interval + ']');
    new Flux('interface|tts|speak', { lg: 'en', msg: 'Bad boy !' });
    let loop = 0;
    setInterval(function () {
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
  setTimeout(function () {
    new Flux('interface|tts|speak', getNewRdmBadBoyTTS());
  }, 1000);
}

/** Function to select a different TTS each time */
const BAD_BOY_TTS_LENGTH = Core.ttsMessages.badBoy.length;
let rdmNbBadBoy,
  lastRdmNbBadBoy = [],
  rdmTTSBadBoy = '';
function getNewRdmBadBoyTTS() {
  do {
    rdmNbBadBoy = Utils.random(BAD_BOY_TTS_LENGTH);
    rdmTTSBadBoy = Core.ttsMessages.badBoy[rdmNbBadBoy];
    if (lastRdmNbBadBoy.length >= BAD_BOY_TTS_LENGTH) lastRdmNbBadBoy.shift();
  } while (lastRdmNbBadBoy.indexOf(rdmNbBadBoy) != -1);
  lastRdmNbBadBoy.push(rdmNbBadBoy);
  return rdmTTSBadBoy;
}
