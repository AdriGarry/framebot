#!/usr/bin/env node
'use strict';

const assert = require('assert');

const CronJobList = require('./../../api/CronJobList'),
  Observers = require('./../../api/Observers');
const { stub, restore } = require('./resources/coreStub');

const MODULES = { interfaces: { base: [], full: [] }, services: { base: ['alpha'], full: [] } };

const EVERY_SECOND = { cron: '* * * * * *', flux: { id: 'service|alpha|tick', conf: { log: 'trace' } } },
  EVERY_YEAR = { cron: '0 0 0 1 1 *', flux: { id: 'service|alpha|newYear', conf: { log: 'trace' } } };

describe('CronJobList', function () {
  let received, startedLists;

  beforeEach(function () {
    stub();
    Observers.init(MODULES);
    received = [];
    startedLists = [];
    Observers.attachFluxParser('service', 'alpha', flux => received.push(flux.id));
  });

  afterEach(function () {
    startedLists.forEach(cronJobList => cronJobList.stop()); // Running crons would keep the test process alive
    restore();
  });

  function start(cronJobList) {
    startedLists.push(cronJobList);
    cronJobList.start();
  }

  describe('constructor', function () {
    it('should have a default id and a length', function () {
      const cronJobList = new CronJobList([EVERY_SECOND, EVERY_YEAR]);
      assert.strictEqual(cronJobList.id, '#');
      assert.strictEqual(cronJobList.length, 2);
      assert.strictEqual(cronJobList.jobList.length, 2);
    });

    it('should use the given id', function () {
      assert.strictEqual(new CronJobList([EVERY_YEAR], 'myList').id, 'myList');
    });
  });

  describe('CronJobList.toString', function () {
    it('should describe the list without crons by default', function () {
      assert.strictEqual(new CronJobList([EVERY_SECOND, EVERY_YEAR], 'myList').toString(), 'CronJobList myList [2] ');
    });

    it('should describe the list with its crons if asked', function () {
      assert.strictEqual(new CronJobList([EVERY_SECOND, EVERY_YEAR], 'myList', true).toString(), 'CronJobList myList [2] [* * * * * *] [0 0 0 1 1 *] ');
    });
  });

  describe('CronJobList.nextDates: return the nearest date of all jobs', function () {
    it('should return the date of the job running the soonest', function () {
      const nextDate = new CronJobList([EVERY_YEAR, EVERY_SECOND]).nextDates();
      assert.ok(nextDate instanceof Date);
      assert.ok(nextDate.getTime() - Date.now() <= 1500);
    });
  });

  describe('CronJobList.start & stop', function () {
    this.timeout(4000);

    it('should fire the flux of the jobs once started', function (done) {
      start(new CronJobList([EVERY_SECOND]));
      setTimeout(() => {
        assert.ok(received.length >= 1);
        assert.strictEqual(received[0], 'tick');
        done();
      }, 1300);
    });

    it('should not fire any flux once stopped', function (done) {
      const cronJobList = new CronJobList([EVERY_SECOND]);
      start(cronJobList);
      cronJobList.stop();
      setTimeout(() => {
        assert.strictEqual(received.length, 0);
        done();
      }, 1300);
    });
  });
});
