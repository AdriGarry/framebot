#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
  fs = require('fs'),
  fsPromises = fs.promises;

const Utils = require('./Utils');

const logger = require('./Logger');

const log = new logger(__filename);

const FILENAME_REGEX = new RegExp(/\/(.+\/)*(?<filename>.+\.(.+))/);
const DURATION_REGEX = new RegExp(/Duration: (?<h>\d{2}):(?<m>\d{2}):(?<s>\d{2})/);

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
          Files.deleteFolderRecursive(curPath);
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

  static getFilename(path) {
    if (typeof path !== 'string') {
      log.error('Path must be a string: ' + typeof path, path);
      return false;
    }
    let matchObj = FILENAME_REGEX.exec(path);
    return matchObj.groups.filename;
  }

  /** Function to retreive last modified date & time of path(s) */
  static getLastModifiedDate(path) {
    if (Array.isArray(path)) {
      path = path.join(' ');
    }
    return new Promise((resolve, reject) => {
      Utils.execCmd('/usr/bin/find ' + path + ' -exec stat \\{} --printf="%y\\n" \\; | sort -n -r | head -n 1')
        .then(data => {
          let lastDate = data.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g);
          resolve(lastDate[0]);
        })
        .catch(err => {
          Core.error('getLastModifiedDate error', err);
          reject(err);
        });
    });
  }

  /** Function to retreive audio or video file duration. Return a Promise */
  static getDuration(soundFile) {
    return new Promise((resolve, reject) => {
      let durationInSec = 0;
      Utils.execCmd(`/usr/bin/ffprobe ${soundFile} 2>&1 | grep -i "Duration"`).then(data => {
        try {
          let matchObj = DURATION_REGEX.exec(data);
          durationInSec += +matchObj.groups.s || 0;
          durationInSec += (+matchObj.groups.m || 0) * 60;
          durationInSec += (+matchObj.groups.h || 0) * 60 * 60;
          log.debug(`getDuration for file ${soundFile}: ${durationInSec} sec`);
          resolve(durationInSec);
        } catch (err) {
          log.error('getDuration error', error);
        }
        reject(durationInSec);
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
