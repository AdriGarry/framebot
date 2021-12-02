#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Scheduler = require('./../../api/Scheduler');

describe('Scheduler', function () {

   describe('Scheduler.decrement', function () {
      it('should execute decrementCallback on each step, then endCallback when timeout is reached', function () {
         let givenIncrement = 0;
         let decrementCallback = function() {
            givenIncrement++;
         };
         let endCallback = function() {
            assert.strictEqual(20, givenIncrement);
         };
         Scheduler.decrement('decrement test', 20, endCallback, 10, decrementCallback);
      });
   });

   describe('Scheduler.debounce', function () {
      it('TODO...', function () {
         assert.fail();
      });
   });

   describe('Scheduler.throttle', function () {
      it('TODO...', function () {
         assert.fail();
      });
   });

});