#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const voices = require('./tts/voices'),
  TTS = require('./tts/TTS'),
  RandomBox = require('randombox').RandomBox;

const VOICE_LIST = Object.keys(voices);
const LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'speak', fn: speak },
  { id: 'lastTTS', fn: lastTTS },
  { id: 'random', fn: speak },
  { id: 'clearTTSQueue', fn: clearTTSQueue }
];

Observers.attachFluxParseOptions('interface', 'tts', FLUX_PARSE_OPTIONS);

let onAir = false,
  ttsQueue = [],
  lastTtsMsg = { voice: 'espeak', lg: 'en', msg: '.undefined' };

/** Function to add TTS message in queue and proceed */
function speak(tts) {
  if (Array.isArray(tts)) {
    log.info('TTS array object... processing');
    tts.forEach(function (message) {
      if (typeof message === 'string' || message.hasOwnProperty('msg')) {
        speak(message);
      }
    });
  } else if (typeof tts === 'string') {
    ttsQueue.push(new TTS(tts));
  } else if (!tts || !Object.keys(tts).length > 0 || tts.msg.toUpperCase().indexOf('RANDOM') > -1) {
    randomTTS();
  } else {
    if (tts.hasOwnProperty('msg')) {
      ttsQueue.push(new TTS(tts.msg, tts.lg, tts.voice));
      log.debug('new TTS [' + (tts.voice || '') + ', ' + (tts.lg || '') + '] "' + tts.msg + '"');
    } else log.debug(console.error('newTTS() Wrong TTS object...', tts));
  }
  if (ttsQueue.length > 0) proceedQueue();
}

/** Function to proceed TTS queue */
let queueInterval,
  currentTTS,
  timeout = 0;
function proceedQueue() {
  log.debug('Start processing TTS queue...');
  queueInterval = setInterval(function () {
    if (!onAir && ttsQueue.length > 0) {
      onAir = true;
      currentTTS = ttsQueue.shift();
      playTTS(currentTTS);
      if (currentTTS.voice === 'google') timeout = currentTTS.msg.length * 100;
      else timeout = currentTTS.msg.length * 90 + 1200;
      setTimeout(function () {
        onAir = false;
      }, timeout);
      if (ttsQueue.length === 0) {
        log.trace('No more TTS, stop processing TTS queue!');
        clearInterval(queueInterval);
      }
    }
  }, 500);
}

/** Function to play TTS message (espeak / google translate) */
function playTTS(tts) {
  Flux.do('service|max|blinkRdmLed');
  log.info(tts.toString());
  tts.setMsgReplaced();

  if (!voices.hasOwnProperty(tts.voice)) return log.error('TTS error: Unsupported voice:', tts.voice);
  voices[tts.voice](tts);

  let blinkDuration = tts.getMsg().length / 2 + 2,
    speed = Utils.random(50, 150);
  Flux.do('interface|led|blink', { leds: ['eye'], speed: speed, loop: blinkDuration }, { log: 'trace' });

  lastTtsMsg = tts;
}

/** Function last TTS message */
function lastTTS() {
  log.info('LastTTS ->', lastTtsMsg);
  speak(lastTtsMsg);
}

/** Function to launch random TTS */
const TTS_RANDOMBOX = new RandomBox(Core.ttsMessages.random);
function randomTTS() {
  let rdmTTS = TTS_RANDOMBOX.next();
  log.info('Random TTS : ', rdmTTS);
  speak(rdmTTS);
}

/** Function to clear TTS Queue */
function clearTTSQueue() {
  ttsQueue = [];
}
