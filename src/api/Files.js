#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
   fs = require('fs'),
   fsPromises = fs.promises,
   os = require('os'),
   request = require('postman-request'),
   dns = require('dns');

const logger = require('./Logger');

const log = new logger(__filename);

module.exports = class Utils {

   /** Function to append an array in JSON file */
   static appendJsonFile(filePath, obj) {
      let startTime = new Date();
      fsPromises
         .readFile(filePath)
         .catch(_fileNotExists)
         .then(data => _appendFileData(data, obj, filePath))
         .then(data => fsPromises.writeFile(filePath, data))
         .then(() => log.debug('file ' + filePath + ' updated in', Utils.executionTime(startTime) + 'ms'))
         .catch(err => log.error('Utils.appendArrayInJsonFile', err));
   }

   /** Get name of files in directory. Return a Promise  */
   static directoryContent(path) {
      return new Promise((resolve, reject) => {
         fs.readdir(path, (err, files) => {
            if (err) {
               reject(err);
            } else {
               resolve(files);
            }
         });
      });
   }

   static deleteFolderRecursive(path) {
      if (fs.existsSync(path)) {
         fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) {
               // recurse
               deleteFolderRecursive(curPath);
            } else {
               // delete file
               fs.unlinkSync(curPath);
            }
         });
         fs.rmdirSync(path);
      }
   }

}