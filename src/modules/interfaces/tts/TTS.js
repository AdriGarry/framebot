#!/usr/bin/env node
'use strict';

const { Core, Logger } = require('./../../../api');

const log = new Logger(__filename);

const FALLBACK_LANGUAGE = 'fr',
  FALLBACK_VOICE = Core.descriptor.fallbackVoice,
  FORCED_VOICE = Core.descriptor.forcedVoice;
log.info('Setting up fallback voice:', FALLBACK_VOICE, FORCED_VOICE ? '/ FORCED_VOICE: ' + FORCED_VOICE : '');

module.exports = class TTS {
  constructor(message, language, voice) {
    this.msg = message;
    if (language) {
      this.lg = language;
    } else {
      log.debug('No valid language, fallback on', FALLBACK_LANGUAGE);
      this.lg = FALLBACK_LANGUAGE;
    }
    if (FORCED_VOICE) {
      log.debug('Use forced voice:', FORCED_VOICE);
      this.voice = FORCED_VOICE;
    } else if (voice) {
      this.voice = voice;
    } else {
      log.debug('No valid voice, fallback on', FALLBACK_LANGUAGE);
      this.voice = FALLBACK_VOICE;
    }
  }

  getMsg() {
    return this.msg;
  }

  getLg() {
    return this.lg;
  }

  getVoice() {
    return this.voice;
  }

  setMsgReplaced() {
    this.msg = this.msg.replace('%20', '');
    return this.msg;
  }

  toString() {
    return 'play TTS [' + this.voice + ', ' + this.lg + '] "' + this.msg + '"';
  }
};
