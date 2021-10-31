#!/usr/bin/env node
'use strict';

const fs = require('fs'),
   fsPromises = fs.promises;

const assert = require('assert');

const Files = require('../../api/Files');

const UNIT_TEST_PATH = './src/test/unit/';
const UNIT_TEST_RESOURCES_PATH = './src/test/unit/resources/';

describe('Files', function () {

   describe('Files.appendJsonFile: add object to array in json file', function () {
      it('should append json file', function (done) {
         const expected = [{ id: 'simpleObject', data: {} }];
         fs.mkdir(UNIT_TEST_RESOURCES_PATH + 'test', () => {
            fs.writeFile(UNIT_TEST_RESOURCES_PATH + 'test/simpleArrayToAppend.json', '[]', (err) => {
               if (err) throw err;
               Files.appendJsonFile(UNIT_TEST_RESOURCES_PATH + 'test/simpleArrayToAppend.json', { id: 'simpleObject', data: {} })
                  .then(() => {
                     fs.readFile(UNIT_TEST_RESOURCES_PATH + 'test/simpleArrayToAppend.json', (err, data) => {
                        assert.deepStrictEqual(JSON.parse(data), expected);
                        done();
                     });
                  })
            });
         });
      });
   });

   describe('Files.getJsonFileContent: ...', function () {
      it('should return json object from simpleObject.json', function (done) {
         const expected = { id: 'simpleObject', data: {} };
         Files.getJsonFileContent(UNIT_TEST_RESOURCES_PATH + 'simpleObject.json')
            .then(data => {
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
         Files.directoryContent(UNIT_TEST_PATH)
            .then(files => {
               assert.ok(4 === files.length);
               done();
            });
      });

      it('should return empty array if directory is empty', function (done) {
         fs.mkdir(UNIT_TEST_RESOURCES_PATH + 'emptyFolder', () => {
            Files.directoryContent(UNIT_TEST_RESOURCES_PATH + 'emptyFolder')
               .then(files => {
                  assert.ok(0 === files.length);
                  done();
               });
         });
      });
   });


   describe('Files.deleteFolderRecursive: ...', function () {
      xit('TODO', function () {
         //
      });
   });

   describe('Files.getAbsolutePath: ...', function () {
      xit('TODO', function () {
         //
      });
   });

   describe('Files.getDuration: ...', function () {
      xit('TODO', function () {
         //
      });
   });
});
