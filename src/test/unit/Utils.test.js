#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Utils = require('./../../api/Utils');

describe('Utils', function () {
   describe('Utils.repeatString', function () {
      it('should return given string concatenated X times', function () {
         const given = 'abc',
            expected = 'abcabcabc';
         const result = Utils.repeatString(given, 3);
         assert.equal(expected, result);
      });
   });
});
