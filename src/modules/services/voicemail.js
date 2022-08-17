#!/usr/bin/env node
'use strict';

const fs = require('fs');

const { Core, Flux, Logger, Observers, Files, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'new', fn: addVoicemailMessage },
  { id: 'check', fn: checkVoicemail },
  { id: 'clear', fn: clearVoicemail }
];

Observers.attachFluxParseOptions('service', 'voicemail', FLUX_PARSE_OPTIONS);

const NO_VOICEMAIL = 'No voicemail message',
  FILE_VOICEMAIL = Core._TMP + 'voicemail.json',
  FILE_VOICEMAIL_HISTORY = Core._LOG + Core.const('name') + '_voicemailHistory.json',
  HOURS_TO_CLEAR_VOICEMAIL = 6;

let clearVoicemailDelay;

setImmediate(() => {
  updateVoicemailMessage();
  log.info('Voicemail flag initialized');
  if (!Core.run('alarm')) {
    checkVoicemail();
  }
});
setInterval(function () {
  updateVoicemailMessage();
}, 10000);

/** Function to persist voicemail message */
function addVoicemailMessage(tts) {
  log.info('New voicemail message :', tts);
  if (typeof tts === 'object' && tts.hasOwnProperty('msg') && typeof tts.msg === 'string') {
    tts.timestamp = Utils.logTime('D/M h:m:s', new Date());
    Files.appendJsonFile(FILE_VOICEMAIL, tts);
    Files.appendJsonFile(FILE_VOICEMAIL_HISTORY, tts);
    setTimeout(function () {
      updateVoicemailMessage();
    }, 1000);
  } else if (typeof tts === 'string') {
    addVoicemailMessage({ msg: tts });
  } else if (Array.isArray(tts)) {
    for (const element of tts) {
      addVoicemailMessage(element);
    }
  } else {
    Core.error("Wrong tts, can't save voicemail", tts);
    return;
  }
}

/** Function to check voicemail, and play */
function checkVoicemail(withTTSResult) {
  log.debug('Checking voicemail...');
  Files.getJsonFileContent(FILE_VOICEMAIL)
    .then(data => {
      if (data) {
        let messages = JSON.parse(data);
        log.debug(messages);
        new Flux('interface|tts|speak', { voice: 'google', lg: 'en', msg: 'Messages' });
        new Flux('interface|tts|speak', messages);
        clearVoicemailLater();
      } else {
        log.debug(NO_VOICEMAIL);
      }
    })
    .catch(err => {
      Core.error('checkVoicemail error', err);
    });
}

/** Function to update runtime with number of voicemail message(s) */
function updateVoicemailMessage() {
  try {
    let messages = fs.readFileSync(FILE_VOICEMAIL, 'UTF-8');
    messages = JSON.parse(messages);
    Core.run('voicemail', messages.length);
    if (Core.run('voicemail') > 0) {
      new Flux('interface|led|blink', { leds: ['belly'], speed: 200, loop: 1 }, { log: 'trace' });
    }
  } catch (e) {
    Core.run('voicemail', 0);
  }
}

/** Function to schedule voicemail deletion */
function clearVoicemailLater() {
  log.info('clearVoicemail');
  if (clearVoicemailDelay) {
    clearTimeout(clearVoicemailDelay);
    clearVoicemailDelay = null;
  }
  clearVoicemailDelay = setTimeout(function () {
    clearVoicemail();
  }, HOURS_TO_CLEAR_VOICEMAIL * 60 * 60 * 1000);
  log.info('Voicemail will be cleared in ' + HOURS_TO_CLEAR_VOICEMAIL + ' hours');
}

/** Function to clear all voicemail messages */
function clearVoicemail() {
  log.info('clearVoicemail');
  fs.unlink(FILE_VOICEMAIL, function (err) {
    if (err) {
      if (err.code === 'ENOENT') log.info('clearVoicemail: No message to delete!');
      else Core.error('Error while deleting voicemail file', err);
    } else {
      updateVoicemailMessage();
      new Flux('interface|tts|speak', { lg: 'en', msg: 'Voicemail Cleared' });
    }
  });
}
