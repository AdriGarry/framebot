#!/usr/bin/env node
'use strict';

console.log('mocha test...')

var assert = require('assert');
describe('Array', function () {
   describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
         assert.equal([1, 2, 3].indexOf(4), -1);
      });
   });
});
