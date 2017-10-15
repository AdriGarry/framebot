#!/usr/bin/env node
"use strict";

// Utils static factory (shoud not require Odi.js || Flux.js) 
var log = new (require(ODI_PATH + "core/Logger.js"))(__filename);

var fs = require('fs');
// var spawn = require('child_process').spawn;
// var exec = require('child_process').exec;
// var os = require('os');
// var util = require('util');

module.exports = {
  // appendJsonFile: appendJsonFile,
  execCmd: execCmd,
  format: {}, // some great functions to format output...
  getJsonFileContent: getJsonFileContent,
  logTime: logTime,
  searchStringInArray: searchStringInArray
  // testConnexion: testConnexion,
};

/** Function getJsonFileContent */
var fileExceptions = ['voicemail.js'];
function getJsonFileContent(filePath, callback) {
  log.debug('getJsonFileContent() ', filePath);
  fs.readFile(filePath, function (err, data) {
    if (err && err.code === 'ENOENT' && !searchStringInArray(filePath, fileExceptions)) {
      log.error('No file: ' + filePath);
      callback(null);
    } else {
      callback(data);
    }
  });
};

/** Function to return date time. Pattern: 'YDT' */
function logTime(param, date) {
  if (typeof date === "undefined") date = new Date();
  var D = date.getDate();
  var M = date.getMonth() + 1;
  var Y = date.getFullYear();
  var h = date.getHours();
  var m = date.getMinutes();
  var s = date.getSeconds();
  var now = "";

  for (var i = 0; i < param.length; i++) {
    switch (param[i]) {
      case "Y":
        now += Y;
        break;
      case "M":
        now += (M < 10 ? "0" : "") + M;
        break;
      case "D":
        now += (D < 10 ? "0" : "") + D;
        break;
      case "h":
        now += (h < 10 ? "0" : "") + h;
        break;
      case "m":
        now += (m < 10 ? "0" : "") + m;
        break;
      case "s":
        now += (s < 10 ? "0" : "") + s;
        break;
      default:
        now += param[i];
    }
  }
  // console.log('utils.now(param)', param, now);
  return now;
}

/** Function getJsonFileContent */
var fileExceptions = ["voicemail.js"];
function getJsonFileContent(filePath, callback) {
  log.debug("getJsonFileContent() ", filePath);
  fs.readFile(filePath, function (err, data) {
    if (
      err &&
      err.code === "ENOENT" &&
      !searchStringInArray(filePath, fileExceptions)
    ) {
      log.error("No file: " + filePath);
      callback(null);
    } else {
      callback(data);
    }
  });
}

/** Function to append object in JSON file */
function appendJsonFile(filePath, obj, callback) {
  log.debug("appendJsonFile() ", filePath, obj);
  var fileData;
  fs.exists(filePath, function (exists) {
    if (exists) {
      log.debug("Yes file exists");
      fs.readFile(filePath, "utf8", function (err, data) {
        if (err) log.error(err);
        else {
          fileData = JSON.parse(data);
          fileData.push(obj);
          fileData = JSON.stringify(fileData, null, 2).replace(/\\/g, "").replace(/\"{/g, "{").replace(/\}"/g, "}");
          log.debug("fileData", fileData);
          fs.writeFile(filePath, fileData, function (cb) {
            log.info("appendJsonFile() LOG FOR CB");
          });
        }
      });
    } else {
      log.debug("File not exists");
      fileData = [];
      fileData.push(obj);
      fileData = JSON.stringify(fileData, null, 2).replace(/\\/g, "").replace(/\"{/g, "{").replace(/\}"/g, "}");
      log.debug(fileData);
      fs.writeFile(filePath, fileData);
    }
  });
}

/** Function to return true if one of string of stringArray is found in string param */
function searchStringInArray(string, stringArray) {
  for (var i = 0; i < stringArray.length; i++) {
    if (string.toLowerCase().search(stringArray[i].toLowerCase()) > -1) {
      return true;
    }
  }
  return false;
}

/** Function to test internet connexion */
function testConnexion(callback) {
  //console.debug('testConnexion()...');
  require("dns").resolve("www.google.com", function (err) {
    if (err) {
      // console.debug('Odi is not connected to internet (utils.testConnexion)   /!\\');
      callback(false);
    } else {
      //console.debug('Odi is online   :');
      callback(true);
    }
  });
}

/** Function to execute a shell command with callback */
function execCmd(command, callback) {
  exec(command, function (error, stdout, stderr) {
    // console.debug('execCmd(' + command + ')\n', stdout);
    if (callback) callback(stdout);
  });
}

/** Function to return date time. Pattern: 'YDT' */
function logTime(param, date) {
  if (typeof date === 'undefined') date = new Date();
  var D = date.getDate();
  var M = date.getMonth() + 1;
  var Y = date.getFullYear();
  var h = date.getHours();
  var m = date.getMinutes();
  var s = date.getSeconds();
  var now = "";

  if (typeof param === "undefined") param = dateTimeDefaultPattern;
  for (var i = 0; i < param.length; i++) {
    switch (param[i]) {
      case "Y":
        now += Y;
        break;
      case "M":
        now += (M < 10 ? "0" : "") + M;
        break;
      case "D":
        now += (D < 10 ? "0" : "") + D;
        break;
      case "h":
        now += (h < 10 ? "0" : "") + h;
        break;
      case "m":
        now += (m < 10 ? "0" : "") + m;
        break;
      case "s":
        now += (s < 10 ? "0" : "") + s;
        break;
      default:
        now += param[i];
    }
  }
  return now;
}

/** Function to return last Odi's start/restart time */
const startHour = new Date().getHours();
const startMin = new Date().getMinutes();
const startTime = (startHour > 12 ? startHour - 12 : startHour) + "." + (startMin < 10 ? "0" : "") + startMin + " " + (startHour > 12 ? "PM" : "AM");
function getStartTime() {
  return startTime;
}

/** Function to repeat/concat a string */
String.prototype.repeat = function (num) {
  return new Array(Math.abs(num) + 1).join(this);
};

/*Object.prototype.toString = () => {
  var obj = this;
  // console.log(obj);
  var string = '';
  for (var prop in obj) {
    string = prop + '=' + obj[prop] + ' ';
  }
  return string;
  // var output = '';
  // for (var property in object) {
  //   output += property + ': ' + object[property]+'; ';
  // }
};*/

