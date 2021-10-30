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