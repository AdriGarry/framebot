#!/usr/bin/env node
'use strict';

const fs = require('fs');

const { Core, Flux, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'play', fn: playAllAudioRecordOrVoicemail },
  { id: 'last', fn: playLastAudioRecordOrVoicemailOrTTS },
  { id: 'clear', fn: clearVoicemailAndRecords }
];

Observers.attachFluxParseOptions('service', 'message', FLUX_PARSE_OPTIONS);

setImmediate(() => {});

/** Function to play all audioRecord or voicemail */
function playAllAudioRecordOrVoicemail() {
  log.info('playAll');
  new Flux('service|voicemail|check');
  new Flux('service|audioRecord|last');
}

/** Function to play last audioRecord or voicemail or last TTS */
function playLastAudioRecordOrVoicemailOrTTS() {
  log.info('playLastAudioRecordOrMessageOrTTS');

  new Flux('service|voicemail|check');
  new Flux('service|audioRecord|last');
}

/** Function to clear all audioRecord and voicemail */
function clearVoicemailAndRecords() {
  new Flux('service|voicemail|clear');
  new Flux('service|audioRecord|clear');
}
