#!/usr/bin/env node
'use strict';

const assert = require('assert'),
  fs = require('fs'),
  os = require('os'),
  path = require('path');

const AccessorObject = require('./../../core/AccessorObject'),
  Files = require('./../../api/Files');

describe('AccessorObject', function () {
  describe('built from an object', function () {
    let accessor;

    beforeEach(function () {
      accessor = new AccessorObject('test', { a: 1, flag: false, nested: { c: 2 } });
    });

    it('should return the whole object when called without argument', function () {
      assert.deepStrictEqual(accessor(), { a: 1, flag: false, nested: { c: 2 } });
    });

    it('should return the value of a key', function () {
      assert.strictEqual(accessor('a'), 1);
    });

    it('should return a falsy value of an existing key', function () {
      assert.strictEqual(accessor('flag'), false);
    });

    it('should return the value of a dotted key', function () {
      assert.strictEqual(accessor('nested.c'), 2);
    });

    it('should return false for an unknown key', function () {
      assert.strictEqual(accessor('unknown'), false);
    });

    it('should set the value of a key', function () {
      accessor('a', 5);
      assert.strictEqual(accessor('a'), 5);
    });

    it('should set the value of a dotted key', function () {
      accessor('nested.c', 9);
      assert.strictEqual(accessor('nested.c'), 9);
    });

    it('should set a falsy value', function () {
      accessor('a', 0);
      assert.strictEqual(accessor('a'), 0);
    });

    it('should update _lastModified when a value is set', function (done) {
      const before = accessor('_lastModified');
      assert.ok(before instanceof Date);
      setTimeout(() => {
        accessor('a', 2);
        assert.ok(accessor('_lastModified') > before);
        done();
      }, 10);
    });
  });

  describe('built from a json file', function () {
    let tempDir, filePath, fileIndex;

    before(function () {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'accessorObject-'));
      fileIndex = 0;
    });

    beforeEach(function () {
      // A new file for each test, because require() caches the content of json files
      filePath = path.join(tempDir, 'conf' + fileIndex++ + '.json');
      fs.writeFileSync(filePath, JSON.stringify({ mode: 'ready', nested: { level: 'info' } }));
    });

    after(function () {
      Files.deleteFolderRecursive(tempDir);
    });

    it('should read values from the file', function () {
      const accessor = new AccessorObject('conf', filePath);
      assert.strictEqual(accessor('mode'), 'ready');
      assert.strictEqual(accessor('nested.level'), 'info');
    });

    it('should persist a value in the file', function () {
      const accessor = new AccessorObject('conf', filePath);
      accessor('mode', 'sleep');
      assert.strictEqual(accessor('mode'), 'sleep');
      assert.strictEqual(JSON.parse(fs.readFileSync(filePath)).mode, 'sleep');
    });

    it('should persist a value of a dotted key in the file', function () {
      const accessor = new AccessorObject('conf', filePath);
      accessor('nested.level', 'debug');
      assert.strictEqual(JSON.parse(fs.readFileSync(filePath)).nested.level, 'debug');
    });

    it('should use the modification date of the file as _lastModified', function () {
      const accessor = new AccessorObject('conf', filePath);
      assert.strictEqual(accessor('_lastModified').getTime(), fs.statSync(filePath).mtime.getTime());
    });
  });
});
