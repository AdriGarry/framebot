#!/usr/bin/env node
'use strict';

const assert = require('assert'),
  fs = require('fs'),
  os = require('os'),
  path = require('path');

const CoreError = require('./../../api/CoreError'),
  Files = require('./../../api/Files'),
  Observers = require('./../../api/Observers');
const { Core, stub, restore } = require('./resources/coreStub');

const MODULES = { interfaces: { base: ['led', 'sound'], full: [] }, services: { base: [], full: [] } };

/** CoreError prints its data and stack trace: keep the output of the test reporter readable */
function createError(message, data, displayStack) {
  const log = console.log;
  console.log = () => {};
  try {
    return new CoreError(message, data, displayStack);
  } finally {
    console.log = log;
  }
}

describe('CoreError', function () {
  let tempDir, fluxes;

  before(function () {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coreError-'));
  });

  beforeEach(function () {
    stub({ const: () => 'unittest', errors: [], _LOG: tempDir + path.sep });
    Observers.init(MODULES);
    fluxes = [];
    Observers.attachFluxParser('interface', 'led', flux => fluxes.push('led|' + flux.id));
    Observers.attachFluxParser('interface', 'sound', flux => fluxes.push('sound|' + flux.id));
  });

  afterEach(restore);

  after(function () {
    Files.deleteFolderRecursive(tempDir);
  });

  it('should be an Error named CoreError with its message and data', function () {
    const error = createError('Something went wrong', { id: 1 });
    assert.ok(error instanceof Error);
    assert.strictEqual(error.name, 'CoreError');
    assert.strictEqual(error.message, 'Something went wrong');
    assert.deepStrictEqual(error.data, { id: 1 });
  });

  it('should display the stack by default, without the message line', function () {
    const error = createError('Something went wrong');
    assert.strictEqual(error.displayStack, true);
    assert.ok(/^\s*at /.test(error.stack));
  });

  it('should not display the stack if asked', function () {
    const error = createError('Something went wrong', null, false);
    assert.strictEqual(error.displayStack, false);
  });

  it('should be added to the errors of Core', function () {
    const error = createError('Something went wrong', { id: 1 });
    assert.strictEqual(Core.errors.length, 1);
    assert.deepStrictEqual(Core.errors[0], { message: 'Something went wrong', data: { id: 1 }, time: error.time });
  });

  it('should notify with leds and error sound', function () {
    createError('Something went wrong');
    assert.deepStrictEqual(fluxes, ['led|altLeds', 'sound|error']);
  });

  it('should be persisted in the error history file', function (done) {
    stub({ const: () => 'persist' }); // Own history file, other tests also persist their errors
    createError('Something went wrong', { id: 1 });
    setTimeout(() => {
      const history = JSON.parse(fs.readFileSync(path.join(tempDir, 'persist_errorHistory.json')));
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].message, 'Something went wrong');
      assert.deepStrictEqual(history[0].data, { id: 1 });
      done();
    }, 200);
  });
});
