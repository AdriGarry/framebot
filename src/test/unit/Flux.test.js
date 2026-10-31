#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Flux = require('./../../api/Flux'),
  Observers = require('./../../api/Observers');
const { stub, restore } = require('./resources/coreStub');

const MODULES = { interfaces: { base: ['led'], full: [] }, services: { base: ['alpha'], full: [] } };
const QUIET = { log: 'trace' };

describe('Flux', function () {
  let calls, received;

  beforeEach(function () {
    calls = stub();
    Observers.init(MODULES);
    received = [];
    Observers.attachFluxParser('service', 'alpha', flux => received.push(flux));
  });

  afterEach(restore);

  describe('Flux.do: fire a flux on the subject of a module', function () {
    it('should fire the flux with its id and value', function () {
      Flux.do('service|alpha|hello', { a: 1 }, QUIET);
      assert.deepStrictEqual(received, [{ id: 'hello', value: { a: 1 } }]);
    });

    it('should fire a flux without value', function () {
      Flux.do('service|alpha|hello', undefined, QUIET);
      assert.deepStrictEqual(received, [{ id: 'hello', value: undefined }]);
    });

    it('should fire a flux given as an object', function () {
      Flux.do({ id: 'service|alpha|hello', data: 'abc', conf: QUIET });
      assert.deepStrictEqual(received, [{ id: 'hello', value: 'abc' }]);
    });

    it('should fire every flux of an array', function () {
      Flux.do([
        { id: 'service|alpha|first', data: 1, conf: QUIET },
        { id: 'service|alpha|second', data: 2, conf: QUIET }
      ]);
      assert.deepStrictEqual(received, [
        { id: 'first', value: 1 },
        { id: 'second', value: 2 }
      ]);
    });

    it('should fire on an interface subject', function () {
      let ledFlux;
      Observers.attachFluxParser('interface', 'led', flux => (ledFlux = flux));
      Flux.do('interface|led|blink', null, QUIET);
      assert.deepStrictEqual(ledFlux, { id: 'blink', value: null });
    });

    it('should count fired flux', function () {
      Flux.do('service|alpha|hello', null, QUIET);
      Flux.do('service|alpha|hello', null, QUIET);
      assert.strictEqual(calls.runValues['stats.fluxCount'], 2);
    });
  });

  describe('Flux.do: invalid flux', function () {
    it('should raise an error and not fire if the id structure is invalid', function () {
      Flux.do('not a flux', null, QUIET);
      assert.strictEqual(received.length, 0);
      assert.strictEqual(calls.errors[0].message, 'Invalid Flux structure');
    });

    it('should raise an error and not fire if the log level is invalid', function () {
      Flux.do('service|alpha|hello', null, { log: 'unknown' });
      assert.strictEqual(received.length, 0);
      assert.strictEqual(calls.errors[0].message, 'Invalid Flux log level');
    });

    it('should not fire if the subject does not exist', function () {
      Flux.do('service|unknown|hello', null, QUIET);
      assert.strictEqual(received.length, 0);
      assert.strictEqual(calls.errors.length, 0);
    });

    it('should not fire if the type does not exist', function () {
      Flux.do('unknown|alpha|hello', null, QUIET);
      assert.strictEqual(received.length, 0);
      assert.strictEqual(calls.errors.length, 0);
    });
  });

  describe('Flux.do: delayed flux', function () {
    it('should fire the flux after the delay (sec)', function (done) {
      Flux.do('service|alpha|hello', 'later', { delay: 0.05, log: 'trace' });
      assert.strictEqual(received.length, 0);
      setTimeout(() => {
        assert.deepStrictEqual(received, [{ id: 'hello', value: 'later' }]);
        done();
      }, 150);
    });

    it('should fire the flux as many times as the loop parameter', function (done) {
      Flux.do('service|alpha|hello', null, { delay: 0.05, loop: 2, log: 'trace' });
      setTimeout(() => {
        assert.strictEqual(received.length, 2);
        done();
      }, 250);
    });
  });

  describe('Flux.toString: describe the flux', function () {
    it('should describe a flux with a value', function () {
      const flux = new Flux('service|alpha|hello', 'abc', QUIET);
      assert.strictEqual(flux.toString().trim(), "service|alpha|hello 'abc'");
    });

    it('should describe a flux without value', function () {
      const flux = new Flux('service|alpha|hello', undefined, QUIET);
      assert.strictEqual(flux.toString().trim(), 'service|alpha|hello');
    });
  });
});
