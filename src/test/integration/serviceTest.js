#!/usr/bin/env node
'use strict';

const assert = require('assert');

const { Core } = require('./../../api');

const log = new (require('../../api/Logger'))(__filename),
  Flux = require('../../api/Flux'),
  Utils = require('../../api/Utils');

log.info('Flux test sequence...');

module.exports.runTest = function (succeedTest) {
  return new Promise((resolve, reject) => {
    Flux.do('service|max|blinkAllLed', null, { delay: 2, loop: 3 });

    assert.strictEqual(Core.run('timer'), 0);
    Flux.do('service|timer|increase');
    setImmediate(() => {
      assert.ok(Core.run('timer'));
    });

    Flux.do('service|max|playOneMelody');

    Flux.do('service|nmap|scan');

    // Flux.do('service|voicemail|new', {msg: 'are you there ?'}, 8);
    // let rdmTTS = Core.ttsMessages.random[Utils.random(Core.ttsMessages.random.length)];
    let rdmTTS = Utils.randomItem(Core.ttsMessages.random);
    while (Array.isArray(rdmTTS)) {
      rdmTTS = Utils.randomItem(Core.ttsMessages.random); // Avoid conversation in voicemail.json
    }
    // let rdmTTS = Utils.randomItem(Core.ttsMessages.random);
    log.DEBUG(rdmTTS);
    Flux.do('service|voicemail|new', rdmTTS, { delay: 8 });
    Flux.do('service|voicemail|check', null, { delay: 11 });
    Flux.do('service|voicemail|clear', null, { delay: 30 });

    Flux.do('service|max|hornRdm');

    Flux.do('service|weather|report', 'random', { delay: 16 });

    setTimeout(() => {
      assert.strictEqual(Core.run('voicemail'), 0);
      assert.strictEqual(Core.errors.length, 0);
      if (Core.errors.length > 0) reject('serviceTest');
      resolve('serviceTest');
    }, 55 * 1000);
  });
};
