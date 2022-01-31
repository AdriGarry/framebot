#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
  fs = require('fs'),
  fsPromises = fs.promises;

const Utils = require('./Utils');

const logger = require('./Logger');

const log = new logger(__filename);

module.exports = class Files {
  /** Function to append an array in JSON file */
  static appendJsonFile(filePath, obj) {
    let startTime = new Date();
    return new Promise((resolve, reject) => {
      fsPromises
        .readFile(filePath)
        .catch(_fileNotExists)
        .then(data => _appendFileData(data, obj, filePath))
        .then(data => fsPromises.writeFile(filePath, data))
        .then(() => {
          log.debug('file ' + filePath + ' updated in', Utils.executionTime(startTime) + 'ms');
          resolve();
        })
        .catch(err => log.error('Utils.appendArrayInJsonFile', err));
    });
  }

  /** Function getJsonFileContent. Return a Promise */
  static getJsonFileContent(filePath) {
    log.debug('getJsonFileContent() ', filePath);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err && err.code === 'ENOENT' && !Utils.searchStringInArray(filePath, FILE_NOT_FOUND_EXCEPT)) {
          log.error('No file: ' + filePath);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
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

  static getAbsolutePath(path, prefix) {
    if (typeof path !== 'string') {
      log.error('Path must be a string: ' + typeof path, path);
      return false;
    }
    if (path.indexOf('/home') === -1) {
      path = prefix + path;
    }
    if (!fs.existsSync(path)) {
      log.error('Wrong file path', path);
      return false;
    }
    return path;
  }

  /** Function to retreive audio or video file duration. Return a Promise */
  static getDuration(soundFile, callback) {
    log.debug('getDuration:', soundFile);
    return new Promise((resolve, reject) => {
      // TODO change mplayer...
      Utils.execCmd('mplayer -ao null -identify -frames 0 ' + soundFile + ' 2>&1 | grep ID_LENGTH')
        .then(data => {
          try {
            if (data == '') {
              getDuration(soundFile, callback);
            }
            let duration = data.split('=')[1].trim();
            resolve(parseInt(duration));
          } catch (err) {
            // Don't log error because the method will call itself until OK !
            reject(err);
          }
        })
        .catch(err => {
          log.error('getDuration error', err);
          reject(err);
        });
    });
  }
};

const FILE_NOT_FOUND_EXCEPT = ['/home/odi/framebot/tmp/voicemail.json', '/home/odi/framebot/tmp/record.json'];

function _fileNotExists(err) {
  return new Promise((resolve, reject) => {
    if (err.code == 'ENOENT') resolve('[]');
    else reject(err);
  });
}

function _appendFileData(data, obj, filePath) {
  return new Promise((resolve, reject) => {
    try {
      let fileData;
      try {
        fileData = JSON.parse(data);
      } catch (err) {
        log.warn(data);
        log.warn('Invalid content for file ' + filePath + '. Reinitializing file with an empty array.');
      }
      if (!Array.isArray(fileData)) fileData = [fileData];

      fileData.push(obj);

      let jsonData = JSON.stringify(fileData, null, 2).replace(/\\/g, '').replace(/\"{/g, '{').replace(/\}"/g, '}');

      resolve(jsonData);
    } catch (err) {
      reject(err);
    }
  });
}
