#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Utils = require('./../../api/Utils');

describe('Utils', function () {

   describe('Utils.repeatString', function () {
      it('should return given string concatenated x times', function () {
         const given = 'abc',
            expected = 'abcabcabc';
         const result = Utils.repeatString(given, 3);
         assert.strictEqual(expected, result);
      });
   });

   describe('Utils.formatStringLength', function () {
      it('should add space at the end of string to math expected length', function () {
         const given = 'abcde',
            expected = 'abcde  ';
         const result = Utils.formatStringLength(given, 7);
         assert.strictEqual(result, expected);
      });

      it('should add space at the begening of string to math expected length', function () {
         const given = 'abcde',
            expected = '  abcde';
         const result = Utils.formatStringLength(given, 7, true);
         assert.strictEqual(result, expected);
      });

      it('should truncate string to math expected length', function () {
         const given = 'abcdefg',
            expected = 'abcde';
         const result = Utils.formatStringLength(given, 5);
         assert.strictEqual(result, expected);
      });
   });

   describe('Utils.searchStringInArray', function () {
      it('should return searched string is present', function () {
         const givenArray = ['abc', 'def', 'hij'],
            expected = 'def';
         const result = Utils.searchStringInArray('def', givenArray);
         assert.strictEqual(expected, result);
      });

      it('should return false if searched string is not present', function () {
         const givenArray = ['abc', 'def', 'hij'];
         const result = Utils.searchStringInArray('xyz', givenArray);
         assert.ok(!result);
      });
   });

   describe('Utils.execCmd', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.debounce', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.throttle', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.firstLetterUpper', function () {
      it('should return string with first letter uppercase', function () {
         const given = 'abc',
            expected = 'Abc';
         const result = Utils.firstLetterUpper(given);
         assert.strictEqual(expected, result);
      });
   });

   describe('Utils.executionTime: should return execution time from given Date in millisec', function () {
      it('should return 10ms as elapsed time since given date initialization', function (done) {
         let startTime = new Date();
         setTimeout(function () {
            let result = Utils.executionTime(startTime)
            if (result >= 10) done()
            else done('executionTime is greater than expected :' + result);
         }, 10);
      });
      it('should return 500ms as elapsed time since given date initialization', function (done) {
         let startTime = new Date();
         setTimeout(function () {
            let result = Utils.executionTime(startTime)
            if (result >= 500) done()
            else done('executionTime is greater than expected :' + result);
         }, 500);
      });
   });

   describe('Utils.formatDuration', function () {
      it('should return time in sec if <= 120', function () {
         const given = 90,
            expected = '90s';
         const result = Utils.formatDuration(given);
         assert.strictEqual(expected, result);
      });

      it('should return time in min & sec if > 120', function () {
         const given = 180,
            expected = '3m0s';
         const result = Utils.formatDuration(given);
         assert.strictEqual(expected, result);
      });
   });

   describe('Utils.rdm', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.randomItem', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.delay', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getLocalIp', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getPublicIp', function () {
      xit('TODO...', function () {
         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.delayMs', function () {
      it('TODO...', function (done) {

         // const given = 'abcdefghijklmno',
         //    expected = 'abcdefg';
         // const result = Utils.formatStringLength(given, 7);
         // assert.strictEqual(expected, result);
      });
   });

   describe('Utils.logTime', function () {
      it('should return date formated as pattern', function () {
         const givenDate = new Date('1999-12-31T00:00:00'),
            expected = '1999-12-31 00:00:00,000';
         const result = Utils.logTime('Y-M-D h:m:s,x', givenDate);
         assert.strictEqual(expected, result);
      });

      it('should return date formated with default pattern', function () {
         const givenDate = new Date('1999-12-31T00:00:00'),
            expected = '31/12 00:00:00';
         let undefinedVariable;
         const result = Utils.logTime(undefinedVariable, givenDate);
         assert.strictEqual(expected, result);
      });
   });

   describe('Utils.getNextDateObject', function () {
      it('should return the nearest date bewteen today and tomorrow', function () {
         let tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         let datesToCompare = [
            { id: 'today', date: new Date() },
            { id: 'tomorrow', date: tomorrow }
         ];
         let nextDate = Utils.getNextDateObject(datesToCompare);
         assert.strictEqual('today', nextDate.id);
      });
      it('should return the nearest hour bewteen next hour and next 2 hours', function () {
         let now = new Date(),
            oneHourLater = new Date(),
            twoHoursLater = new Date();
         oneHourLater.setHours(now.getHours() + 1);
         twoHoursLater.setHours(now.getHours() + 2);
         let datesToCompare = [
            { id: 'oneHourLater', date: oneHourLater },
            { id: 'twoHoursLater', date: twoHoursLater }
         ];
         let nextDate = Utils.getNextDateObject(datesToCompare);
         assert.strictEqual('oneHourLater', nextDate.id);
      });
   });

   describe('Utils.isWeekend', function () {
      it('should return true if weekend', function () {
         const givenDate = new Date('2000-01-01');
         const result = Utils.isWeekend(givenDate);
         assert.ok(result);
      });

      it('should return false if not weekend', function () {
         const givenDate = new Date('1999-12-31');
         const result = Utils.isWeekend(givenDate);
         assert.ok(!result);
      });
   });

   describe('Utils.getWeek', function () {
      it('should return week number of given date', function () {
         const givenDate = new Date('2000-01-01');
         const result = Utils.getWeek(givenDate);
         assert.strictEqual(1, result);
      });
   });

});
