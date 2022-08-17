#!/usr/bin/env node
'use strict';

const fs = require('fs');

const { Core, Flux, Logger, Observers, Scheduler } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'play', fn: playAllAudioRecordOrVoicemailIfAny },
  { id: 'last', fn: playLastAudioRecordOrVoicemailOrTTS },
  { id: 'clear', fn: clearVoicemailAndRecords }
];

Observers.attachFluxParseOptions('service', 'message', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  if (!Core.run('alarm')) {
    Scheduler.delay(2).then(() => playAllAudioRecordOrVoicemailIfAny());
  }
});

function playAllAudioRecordOrVoicemailIfAny() {
  log.debug('playAllAudioRecordOrVoicemail');
  new Flux('service|audioRecord|check');
  new Flux('service|voicemail|check', null, { delay: Core.run('audioRecord') * 15 });
}

function playLastAudioRecordOrVoicemailOrTTS() {
  log.info('playLastAudioRecordOrMessageOrTTS');
  if (Core.run('audioRecord')) new Flux('service|audioRecord|last');
  else if (Core.run('voicemail')) new Flux('service|voicemail|check');
  else new Flux('interface|tts|lastTTS');
}

function clearVoicemailAndRecords() {
  new Flux('service|voicemail|clear');
  new Flux('service|audioRecord|clear');
}
