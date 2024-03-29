#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const RandomBox = require('randombox').RandomBox;

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'parse', fn: parseDataFromMax },
  { id: 'blinkAllLed', fn: blinkAllLed },
  { id: 'blinkRdmLed', fn: blinkRdmLed },
  { id: 'playOneMelody', fn: playOneMelody },
  { id: 'playRdmMelody', fn: playRdmMelody },
  { id: 'hornRdm', fn: hornRdm },
  { id: 'hornSiren', fn: hornSiren },
  { id: 'turn', fn: turnNose }
];

Observers.attachFluxParseOptions('service', 'max', FLUX_PARSE_OPTIONS);

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

function blinkAllLed() {
  log.debug('blinkAllLed');
  Flux.do('interface|arduino|write', 'blinkAllLed');
}

function blinkRdmLed() {
  log.debug('blinkRdmLed');
  Flux.do('interface|arduino|write', 'blinkRdmLed');
}

function playOneMelody() {
  log.debug('playOneMelody');
  Flux.do('interface|arduino|write', 'playOneMelody');
}

function playRdmMelody() {
  log.debug('playRdmMelody');
  Flux.do('interface|arduino|write', 'playRdmMelody');
}

function turnNose() {
  log.debug('turnNose');
  Flux.do('interface|arduino|write', 'turnNose');
}

let hornRandomBox = new RandomBox(HORNS);
function hornRdm() {
  let horn = hornRandomBox.next();
  log.debug('hornRdm', horn);
  Flux.do('interface|arduino|write', horn);
}

function hornSiren() {
  log.debug('playHornWarning');
  Flux.do('interface|arduino|write', 'playHornWarning');
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
      if (Core.run('etat') == 'high') Flux.do('interface|tts|speak', { lg: 'en', msg: 'blink led' });
      break;
    case 'playOneMelody_end':
    case 'playRdmMelody_end':
      maxCallbackTTS(Core.ttsMessages.maxCallback.melody);
      break;
    case 'turnNose_end':
      if (Core.run('etat') == 'high') Flux.do('interface|tts|speak', { lg: 'en', msg: 'turn' });
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
      Flux.do('interface|tts|speak', 'OVNI!');
      break;
    case 'playHornWarning_end':
    case 'playHornBombing_end':
      Flux.do('interface|tts|speak', 'A couvert !');
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

//const maxCallbackRandomBox = new RandomBox(); // TODO to implement
function maxCallbackTTS(arg) {
  if (Array.isArray(arg)) {
    Flux.do('interface|tts|speak', Utils.randomItem(arg));
  } else if (typeof arg == 'string') {
    Flux.do('interface|tts|speak', arg);
  } else {
    log.error('maxCallbackTTS: wrong arg [' + typeof arg + ']', arg);
  }
}

// list of commands:
//blinkAllLed();
// Flux.do('interface|arduino|write', 'hi', { delay: 3 });
// Flux.do('service|max|blinkAllLed', null, { delay: 6 });
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
