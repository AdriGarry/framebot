#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Scheduler = require('./../../api/Scheduler');

describe('Scheduler', function () {
  describe('Scheduler.delay: return a promise resolved after given delay (sec)', function () {
    it('should wait 0.3s before trigger callback', function (done) {
      let given = true;
      let result = false;
      Scheduler.delay(0.3).then(function () {
        result = given;
      });
      setTimeout(() => {
        assert.ok(!result);
      }, 200);
      setTimeout(() => {
        assert.ok(result);
        done();
      }, 301);
    });
  });

  describe('Scheduler.delayMs: return a promise resolved after given delay (ms)', function () {
    it('should wait 50ms before trigger callback', function (done) {
      let given = true;
      let result = false;
      Scheduler.delayMs(50).then(function () {
        result = given;
      });
      setTimeout(() => {
        assert.ok(!result);
      }, 10);
      setTimeout(() => {
        assert.ok(result);
        done();
      }, 51);
    });
  });

  describe('Scheduler.decrement', function () {
    it('should execute decrementCallback on each step, then endCallback when timeout is reached', function () {
      let givenIncrement = 0;
      let decrementCallback = function () {
        givenIncrement++;
      };
      let endCallback = function () {
        assert.strictEqual(3, givenIncrement);
      };
      Scheduler.decrement('test', 3, endCallback, 1, decrementCallback);
    });
  });

  describe('Scheduler.stopDecrement', function () {
    it('should not throw error on decrement without active decrement for specified ID', function () {
      Scheduler.stopDecrement('randomId');
    });
  });

  describe('Scheduler.debounce', function () {
    xit('TODO...', function () {
      assert.fail();
    });
  });

  describe('Scheduler.throttle', function () {
    xit('TODO...', function () {
      assert.fail();
    });
  });
});
