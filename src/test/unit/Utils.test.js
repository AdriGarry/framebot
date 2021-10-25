#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Utils = require('./../../api/Utils');

console.log(Object.getOwnPropertyNames(Utils))

describe('Utils', () => {
   describe('Utils.repeatString', () => {
      it('should return given string concatenated X times', () => {
         const given = 'abc',
            expected = 'abcabcabc';
         const result = Utils.repeatString(given, 3);
         assert.equal(expected, result);
      });
   });

   describe('Utils.formatStringLength', () => {
      it('should add space at the end of string to math expected length', () => {
         const given = 'abcde',
            expected = 'abcde  ';
         const result = Utils.formatStringLength(given, 7);
         assert.strictEqual(result, expected);
      });

      it('should add space at the begening of string to math expected length', () => {
         const given = 'abcde',
            expected = '  abcde';
         const result = Utils.formatStringLength(given, 7, true);
         assert.strictEqual(result, expected);
      });

      it('should truncate string to math expected length', () => {
         const given = 'abcdefg',
            expected = 'abcde';
         const result = Utils.formatStringLength(given, 5);
         assert.strictEqual(result, expected);
      });
   });

   describe('Utils.toto', () => {
      xit('toto... TODO', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
         // console.log(expected, result);
      });
   });
});
