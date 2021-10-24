#!/usr/bin/env node
'use strict';

global._PATH = "./../../"; // Hack to assignate global _PATH constant

const fs = require('fs'),
   path = require('path'),
   assert = require('assert');

const UNIT_TEST_INDEX_FILENAME = __filename.split(/[\\/]/).pop();

console.log('Mocha test sequence...', new Date())

describe('Array', function () {
   describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
         assert.equal([1, 2, 3].indexOf(4), -1);
      });
   });
});

loadUnitTestFiles();

function loadUnitTestFiles() {
   fs.readdir(__dirname, (err, files) => {
      if (err) console.error(err);
      console.log('Unit test files', files);
      files.forEach(testFile => {
         if (UNIT_TEST_INDEX_FILENAME !== testFile) {
            require(__dirname + path.sep + testFile);
         }
      })
   })
}
