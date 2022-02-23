#!/usr/bin/env node
'use strict';

const fs = require('fs'),
  fsPromises = fs.promises;

const assert = require('assert');

const Files = require('../../api/Files');

const UNIT_TEST_PATH = './src/test/unit/';
const UNIT_TEST_RESOURCES_PATH = './src/test/unit/resources/';
const UNIT_TEST_RESOURCES_TEMP_PATH = './src/test/unit/resources/temp/';

describe('Files', function () {
  describe('Files.appendJsonFile: add object to array in json file', function () {
    it('should append json file', function (done) {
      const expected = [{ id: 'simpleObject', data: {} }];
      fs.mkdir(UNIT_TEST_RESOURCES_TEMP_PATH, () => {
        fs.writeFile(UNIT_TEST_RESOURCES_TEMP_PATH + 'simpleArrayToAppend.json', '[]', err => {
          if (err) throw err;
          Files.appendJsonFile(UNIT_TEST_RESOURCES_TEMP_PATH + 'simpleArrayToAppend.json', { id: 'simpleObject', data: {} }).then(() => {
            fs.readFile(UNIT_TEST_RESOURCES_TEMP_PATH + 'simpleArrayToAppend.json', (err, data) => {
              assert.deepStrictEqual(JSON.parse(data), expected);
              done();
            });
          });
        });
      });
    });
  });

  describe('Files.getJsonFileContent: read json file and return a promise with content parsed', function () {
    it('should return json object from simpleObject.json', function (done) {
      const expected = { id: 'simpleObject', data: {} };
      Files.getJsonFileContent(UNIT_TEST_RESOURCES_PATH + 'simpleObject.json').then(data => {
        if (data) {
          let objectFromFile = JSON.parse(data);
          assert.deepStrictEqual(objectFromFile, expected);
          done();
        }
        assert.ok(false);
      });
    });
  });

  describe('Files.directoryContent: return array of file in a given directory', function () {
    it('should return number of files in ' + UNIT_TEST_PATH, function (done) {
      Files.directoryContent(UNIT_TEST_PATH).then(files => {
        assert.ok(5 === files.length);
        done();
      });
    });

    it('should return empty array if directory is empty', function (done) {
      fs.mkdir(UNIT_TEST_RESOURCES_PATH + 'emptyFolder', () => {
        Files.directoryContent(UNIT_TEST_RESOURCES_PATH + 'emptyFolder').then(files => {
          assert.ok(0 === files.length);
          done();
        });
      });
    });
  });

  describe('Files.deleteFolderRecursive: delete folder recursively', function () {
    it("should delete 'test' folder recursively", function () {
      Files.deleteFolderRecursive(UNIT_TEST_RESOURCES_TEMP_PATH);
      assert.ok(!fs.existsSync(UNIT_TEST_RESOURCES_TEMP_PATH));
    });
  });

  describe('Files.getAbsolutePath: return absolute path or prefixed', function () {
    it('should return absolute path', function () {
      let expected = './src/wrapper.js';
      let result = Files.getAbsolutePath('wrapper.js', './src/');
      assert.strictEqual(result, expected);
    });
  });

  describe('Files.getDuration: ...', function () {
    xit('TODO', function () {
      //
    });
  });
});
