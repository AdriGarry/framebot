#!/usr/bin/env node
'use strict';

const assert = require('assert');

const Observers = require('./../../api/Observers');
const { stub, restore } = require('./resources/coreStub');

const MODULES = { interfaces: { base: ['led'], full: ['sound'] }, services: { base: ['alpha'], full: ['beta'] } };

describe('Observers', function () {
  let calls;

  beforeEach(function () {
    calls = stub();
    Observers.init(MODULES); // New subjects for each test, so subscriptions don't pile up
  });

  afterEach(restore);

  describe('Observers.init: create a subject for each module of the descriptor', function () {
    it('should create subjects for interfaces and services, base and full', function () {
      assert.deepStrictEqual(Object.keys(Observers.interface()), ['led', 'sound']);
      assert.deepStrictEqual(Object.keys(Observers.service()), ['alpha', 'beta']);
    });

    it('should be ready and list module types', function () {
      assert.ok(Observers.isReady());
      assert.ok(Observers.modules().includes('interface'));
      assert.ok(Observers.modules().includes('service'));
    });
  });

  describe('Observers.attachFluxParseOptions: call the function matching the flux id', function () {
    it('should call the function of the matching id with the flux value', function () {
      let received;
      Observers.attachFluxParseOptions('service', 'alpha', [
        { id: 'hello', fn: value => (received = value) },
        { id: 'other', fn: () => assert.fail('wrong id called') }
      ]);
      Observers.service().alpha.next({ id: 'hello', value: 42 });
      assert.strictEqual(received, 42);
      assert.strictEqual(calls.errors.length, 0);
    });

    it('should raise an error for an unmapped flux id', function () {
      Observers.attachFluxParseOptions('service', 'alpha', [{ id: 'hello', fn: () => assert.fail('should not be called') }]);
      Observers.service().alpha.next({ id: 'unknown', value: null });
      assert.strictEqual(calls.errors.length, 1);
      assert.strictEqual(calls.errors[0].message, 'unmapped flux in alpha service');
    });

    it('should call the function when the awake condition matches', function () {
      let called = false;
      stub({ isAwake: () => true });
      Observers.attachFluxParseOptions('service', 'alpha', [{ id: 'hello', fn: () => (called = true), condition: { isAwake: true } }]);
      Observers.service().alpha.next({ id: 'hello' });
      assert.ok(called);
    });

    it('should not call the function when the awake condition does not match', function () {
      let called = false;
      stub({ isAwake: () => false });
      Observers.attachFluxParseOptions('service', 'alpha', [{ id: 'hello', fn: () => (called = true), condition: { isAwake: true } }]);
      Observers.service().alpha.next({ id: 'hello' });
      assert.ok(!called);
    });

    it('should call the function when the sleep condition matches', function () {
      let called = false;
      stub({ isAwake: () => false });
      Observers.attachFluxParseOptions('service', 'alpha', [{ id: 'hello', fn: () => (called = true), condition: { isAwake: false } }]);
      Observers.service().alpha.next({ id: 'hello' });
      assert.ok(called);
    });

    it('should raise an error when the subject fails', function () {
      Observers.attachFluxParseOptions('service', 'alpha', [{ id: 'hello', fn: () => {} }]);
      Observers.service().alpha.error(new Error('failure'));
      assert.strictEqual(calls.errors.length, 1);
      assert.strictEqual(calls.errors[0].message, 'Flux error');
    });
  });

  describe('Observers.attachFluxParser: give the whole flux to a custom parser', function () {
    it('should call the parser with id and value', function () {
      let received;
      Observers.attachFluxParser('interface', 'led', flux => (received = flux));
      Observers.interface().led.next({ id: 'blink', value: { speed: 1 } });
      assert.deepStrictEqual(received, { id: 'blink', value: { speed: 1 } });
    });

    it('should raise an error when the subject fails', function () {
      Observers.attachFluxParser('interface', 'led', () => {});
      Observers.interface().led.error(new Error('failure'));
      assert.strictEqual(calls.errors[0].message, 'Flux error');
    });
  });
});
