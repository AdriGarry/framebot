#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Utils = require('./../../api/Utils');

describe('Utils', function () {
  describe('Utils.repeatString: return given string concatenated x times', function () {
    it("should 'abc' get concatenated 3 times", function () {
      const given = 'abc',
        expected = 'abcabcabc';
      const result = Utils.repeatString(given, 3);
      assert.strictEqual(result, expected);
    });
  });

  describe('Utils.formatStringLength: return string with length matching with given limit', function () {
    it('should add space at the end of string to math expected length', function () {
      const given = 'abcde',
        expected = 'abcde  ';
      const result = Utils.formatStringLength(given, 7);
      assert.strictEqual(result, expected);
    });

    it('should add dot characters at the end of string to math expected length', function () {
      const given = 'abcde',
        expected = 'abcde...';
      const result = Utils.formatStringLength(given, 8, false, '.');
      assert.strictEqual(result, expected);
    });

    it('should add space at the begening of string to math expected length', function () {
      const given = 'abcde',
        expected = '  abcde';
      const result = Utils.formatStringLength(given, 7, true);
      assert.strictEqual(result, expected);
    });

    it('should add underscore character at the begening of string to math expected length', function () {
      const given = 'abcde',
        expected = '__abcde';
      const result = Utils.formatStringLength(given, 7, true, '_');
      assert.strictEqual(result, expected);
    });

    it('should truncate string to math expected length', function () {
      const given = 'abcdefg',
        expected = 'abcde';
      const result = Utils.formatStringLength(given, 5);
      assert.strictEqual(result, expected);
    });
  });

  describe('Utils.searchStringInArray: return matching string in given array', function () {
    it('should return searched string is present', function () {
      const givenArray = ['abc', 'def', 'hij'],
        expected = 'def';
      const result = Utils.searchStringInArray('def', givenArray);
      assert.strictEqual(result, expected);
    });

    it('should return false if searched string is not present', function () {
      const givenArray = ['abc', 'def', 'hij'];
      const result = Utils.searchStringInArray('xyz', givenArray);
      assert.ok(!result);
    });
  });

  describe('Utils.execCmd: execute given command and return a promise', function () {
    it("should 'uptime' command return string including 'load average'", function () {
      Utils.execCmd('/usr/bin/uptime').then(data => {
        if (data.indexOf('load average') > -1) {
          assert.ok();
        }
        assert.fail();
      });
    });
  });

  describe('Utils.firstLetterUpper: return given string with first letter capitalized', function () {
    it('should return string with first letter uppercase', function () {
      const given = 'abc',
        expected = 'Abc';
      const result = Utils.firstLetterUpper(given);
      assert.strictEqual(result, expected);
    });
  });

  describe('Utils.getDifferenceInSec: return difference in seconds between given date and optional date or now', function () {
    it('should return 3600 seconds', function () {
      let now = new Date();
      let nowPlusOneHour = new Date(now.setHours(now.getHours() + 1));
      let result = Utils.getDifferenceInSec(nowPlusOneHour);
      assert.strictEqual(3600, result);
    });
    it('should return 10 seconds', function () {
      const given = new Date('1999-12-31T00:00:00'),
        given2 = new Date('1999-12-31T00:00:10'),
        expected = 10;
      const result = Utils.getDifferenceInSec(given, given2);
      assert.strictEqual(result, expected);
    });
  });

  describe('Utils.executionTime: should return execution time from given Date in millisec', function () {
    it('should return 10ms as elapsed time since given date initialization', function (done) {
      let startTime = new Date();
      setTimeout(function () {
        let result = Utils.executionTime(startTime);
        if (result >= 10) done();
        else done('executionTime is greater than expected :' + result);
      }, 10);
    });

    it('should return 500ms as elapsed time since given date initialization', function (done) {
      let startTime = new Date();
      setTimeout(function () {
        let result = Utils.executionTime(startTime);
        if (result >= 500) done();
        else done('executionTime is greater than expected :' + result);
      }, 500);
    });
  });

  describe('Utils.formatDuration: return sec or min', function () {
    it('should return time in sec if <= 60', function () {
      const given = 59,
        expected = '59s';
      const result = Utils.formatDuration(given);
      assert.strictEqual(result, expected);
    });

    it('should return time in min & sec if > 60', function () {
      const given = 60,
        expected = '1m00s';
      const result = Utils.formatDuration(given);
      assert.strictEqual(result, expected);
    });

    it('should return time in min & sec if > 120', function () {
      const given = 180,
        expected = '3m00s';
      const result = Utils.formatDuration(given);
      assert.strictEqual(result, expected);
    });

    it('should return time in hours min & sec if > one hour', function () {
      const given = 1.5 * 60 * 60 + 20,
        expected = '1h30m20s';
      const result = Utils.formatDuration(given);
      assert.strictEqual(result, expected);
    });

    it('should return time in hours min & sec if > one hour', function () {
      const given = 12 * 60 * 60,
        expected = '12h00m00s';
      const result = Utils.formatDuration(given);
      assert.strictEqual(result, expected);
    });
  });

  describe('Utils.random: return a number between 0 and given number (excluded)', function () {
    it('should return a number between 0 and 1', function () {
      let loop = 10;
      while (loop) {
        let result = Utils.random();
        if (result > 1 && result < 0) assert.fail();
        loop--;
      }
    });

    it('should return a number between 0 and 5', function () {
      let loop = 20;
      while (loop) {
        let result = Utils.random(6);
        if (result > 3 && result < 0) assert.fail();
        loop--;
      }
    });
  });

  describe('Utils.randomItem: return an object randomly from given array', function () {
    it('should return one of the items of the array', function () {
      let given = ['abc', 'def', 'ghi'],
        loop = 10;

      while (loop) {
        let result = Utils.randomItem(given);
        if (!given.includes(result)) {
          assert.fail();
        }
        loop--;
      }
    });
  });

  describe('Utils.logTime: return date/time formated as given pattern', function () {
    it('should return date formated as pattern', function () {
      const givenDate = new Date('1999-12-31T00:00:00'),
        expected = '1999-12-31 00:00:00,000';
      const result = Utils.logTime('Y-M-D h:m:s,x', givenDate);
      assert.strictEqual(result, expected);
    });

    it('should return date formated with default pattern', function () {
      const givenDate = new Date('1999-12-31T00:00:00'),
        expected = '31/12 00:00:00';
      let undefinedVariable;
      const result = Utils.logTime(undefinedVariable, givenDate);
      assert.strictEqual(result, expected);
    });
  });

  describe('Utils.isWeekend: return true if today is weekend, false otherwise', function () {
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

  describe('Utils.getWeek: return number of week', function () {
    it('should return week number of given date', function () {
      const givenDate = new Date('2000-01-01');
      const result = Utils.getWeek(givenDate);
      assert.strictEqual(1, result);
    });
  });
});
