#!/usr/bin/env node
'use strict';

const Core = require('./../../../core/Core').api;

const saved = {};

/** Replace Core members (run, error, isAwake by default) by in-memory stubs. Call restore() to put the originals back */
function stub(overrides) {
  const runValues = { 'stats.fluxCount': 0 };
  const calls = { errors: [], runValues: runValues };

  const stubbed = {
    run: (key, value) => {
      if (value !== undefined) runValues[key] = value;
      return runValues[key];
    },
    error: (message, data) => calls.errors.push({ message: message, data: data }),
    isAwake: () => true,
    ...overrides
  };

  Object.keys(stubbed).forEach(key => {
    if (!saved.hasOwnProperty(key)) saved[key] = { exists: key in Core, value: Core[key] };
    Core[key] = stubbed[key];
  });
  return calls;
}

function restore() {
  Object.keys(saved).forEach(key => {
    if (saved[key].exists) Core[key] = saved[key].value;
    else delete Core[key];
    delete saved[key];
  });
}

module.exports = { Core, stub, restore };
