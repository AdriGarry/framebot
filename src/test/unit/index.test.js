#!/usr/bin/env node
'use strict';

const fs = require('fs'),
  path = require('path'),
  assert = require('assert');

global._PATH = './../../'; // Hack to set global _PATH constant
const UNIT_TEST_INDEX_FILENAME = __filename.split(/[\\/]/).pop();

describe('Unit test sequence with Mocha', function () {
  it('Loading all tests...', function () {
    loadUnitTestFiles();
  });
});

function loadUnitTestFiles() {
  fs.readdir(__dirname, (err, files) => {
    if (err) console.error(err);
    files.forEach(testFile => {
      if (UNIT_TEST_INDEX_FILENAME !== testFile && 'resources' !== testFile) {
        require(__dirname + path.sep + testFile);
        assert.ok(true);
      }
    });
  });
}
