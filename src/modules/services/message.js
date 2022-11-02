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
  Flux.do('service|audioRecord|check');
  Flux.do('service|voicemail|check', null, { delay: Core.run('audioRecord') * 15 });
}

function playLastAudioRecordOrVoicemailOrTTS() {
  log.info('playLastAudioRecordOrMessageOrTTS');
  if (Core.run('audioRecord')) Flux.do('service|audioRecord|last');
  else if (Core.run('voicemail')) Flux.do('service|voicemail|check');
  else Flux.do('interface|tts|lastTTS');
}

function clearVoicemailAndRecords() {
  Flux.do('service|voicemail|clear');
  Flux.do('service|audioRecord|clear');
}
