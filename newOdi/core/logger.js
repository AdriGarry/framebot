#!/usr/bin/env node
"use strict";

var util = require("util");

module.exports = Logger;

const dateTimeDefaultPattern = "D/M h:m:s";
var modeDebug = false;

function Logger(filename, debugMode, dateTimePattern) {
  modeDebug = debugMode || modeDebug;
  //if (modeDebug) info('DEBUG mode');
  // console.log('Logger.debugMode:', debugMode, 'Logger.modeDebug:', modeDebug);
  dateTimePattern = dateTimePattern || dateTimeDefaultPattern;
  filename = filename.match(/(\w*).js/g)[0];
  // debug('Logger init [' + filename + (modeDebug ? ', debug]' : ']'));
  debug("Logger init [" + filename + "]");

  this.info = info;
  this.INFO = INFO; // TO TEST...
  // console.log('--debugMode', modeDebug);
  this.debug = debug;
  this.DEBUG = DEBUG;
  this.error = error;
  this.logTime = logTime;
  return this;

  function setLog(args) {
    if (typeof args === "string") {
      return args;
    }
    var log = "";
    for (var i in args) {
      if (typeof args[i] == "object") {
        log = log + util.format(util.inspect(args[i]) + " ");
      } else {
        log = log + args[i] + " ";
      }
    }
    return log;
  }

  function info() {
    var log = setLog(arguments);
    console.log(logTime(), "[" + filename + "]", log);
  }

  function INFO() {
    var log = setLog(arguments);
    console.log(
      logTime(),
      "[" + filename.toUpperCase() + "]",
      log.toUpperCase()
    );
  }

  function debug() {
    if (!modeDebug) return;
    var log = setLog(arguments);
    console.log(logTime(), "[" + filename + "]\u2022", log);
  }

  function DEBUG() {
    if (!modeDebug) return;
    var log = setLog(arguments);
    console.log(
      logTime(),
      "[" + filename.toUpperCase() + "]\u2022",
      log.toUpperCase()
    );
  }

  function error() {
    var log = setLog(arguments);
    console.error("\r\n" + logTime(), "[" + filename + "]", ">> ERR_", log);
  }

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
}
