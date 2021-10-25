#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Utils = require('./../../api/Utils');

describe('Utils', () => {
   describe('Utils.codePosition', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.repeatString', () => {
      it('should return given string concatenated x times', () => {
         const given = 'abc',
            expected = 'abcabcabc';
         const result = Utils.repeatString(given, 3);
         assert.strictEqual(expected, result);
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

   describe('Utils.deleteFolderRecursive', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.appendJsonFile', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.directoryContent', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getJsonFileContent', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.searchStringInArray', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.arrayToObject', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.testConnection', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getLocalIp', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getPublicIp', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.postOdi', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.execCmd', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.debounce', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.throttle', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getAbsolutePath', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getDuration', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.firstLetterUpper', () => {
      it('should return string with first letter uppercase', () => {
         const given = 'abc',
            expected = 'Abc';
         const result = Utils.firstLetterUpper(given);
         assert.strictEqual(expected, result);
      });
   });

   describe('Utils.executionTime', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.addPatternBefore', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.formatDuration', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.numberWithDot', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.perCent', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.rdm', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.randomItem', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.delay', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.delayMs', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.logTime', () => {
      it('should return date formated as pattern', () => {
         const givenDate = new Date('1999-12-31'),
            expected = '1999-12-31 01:00:00,000';
         const result = Utils.logTime('Y-M-D h:m:s,x', givenDate);
         assert.strictEqual(expected, result);
      });

      it('should return date formated with default pattern', () => {
         const givenDate = new Date('1999-12-31'),
            expected = '31/12 01:00:00';
         let undefinedVariable;
         const result = Utils.logTime(undefinedVariable, givenDate);
         assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getNextDateObject', () => {
      xit('TODO...', () => {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.isWeekend', () => {
      it('should return true if weekend', () => {
         const givenDate = new Date('2000-01-01');
         const result = Utils.isWeekend(givenDate);
         assert.ok(result);
      });

      it('should return false if not weekend', () => {
         const givenDate = new Date('1999-12-31');
         const result = Utils.isWeekend(givenDate);
         assert.ok(!result);
      });
   });

});