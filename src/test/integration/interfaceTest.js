#!/usr/bin/env node
'use strict';

const assert = require('assert');

const { Core } = require('./../../api');

const log = new (require('../../api/Logger'))(__filename),
  Flux = require('../../api/Flux');

log.info('Module test sequence...');

module.exports.runTest = function (succeedTest) {
  return new Promise((resolve, reject) => {
    assert.ok(Core.conf());
    assert.strictEqual(Core.conf('mode'), 'test');
    assert.ok(Core.isAwake());

    assert.ok(Core.run());
    assert.strictEqual(Core.run('music'), false);
    assert.strictEqual(Core.run('alarm'), false);

    Flux.do('interface|sound|volume', 60);
    Flux.do('interface|sound|volume', 40, { delay: 4 });

    Flux.do('interface|hardware|cpuTTS', null, { delay: 1 });

    setTimeout(() => {
      assert.strictEqual(Core.errors.length, 0);
      Flux.do('interface|sound|mute', { delay: 5, message: 'DELAY 3' });
      setTimeout(() => {
        if (Core.errors.length > 0) reject('interfaceTest');
        resolve('interfaceTest');
      }, 5000);
    }, 50 * 1000);
  });
};
