#!/usr/bin/env node
'use strict';

const fs = require('fs'),
   path = require('path');

global._PATH = "./../../"; // Hack to assignate global _PATH constant
const UNIT_TEST_INDEX_FILENAME = __filename.split(/[\\/]/).pop();

describe('Unit test sequence with Mocha', () => {
   it('Loading all tests...', () => {
      loadUnitTestFiles();
   });
});


function loadUnitTestFiles() {
   fs.readdir(__dirname, (err, files) => {
      if (err) console.error(err);
      files.forEach(testFile => {
         if (UNIT_TEST_INDEX_FILENAME !== testFile) {
            require(__dirname + path.sep + testFile);
         }
      })
   })
}
