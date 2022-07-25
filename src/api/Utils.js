#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
  os = require('os'),
  util = require('util'),
  crypto = require('crypto');

const logger = require('./Logger');

const log = new logger(__filename);

const DATE_TIMEDEFAULT_PATTERN = 'D/M h:m:s';
const MILLISEC_IN_DAY = 86400000;
module.exports = class Utils {
  static formatDuration(duration) {
    duration = parseInt(duration);
    if (duration >= 60 * 60) {
      return (
        Math.floor(duration / (60 * 60)) +
        'h' +
        Utils.formatStringLength(Math.floor((duration % (60 * 60)) / 60).toString(), 2, true, '0') +
        'm' +
        Utils.formatStringLength((duration % 60).toString(), 2, true, '0') +
        's'
      );
    } else if (duration >= 60) {
      return Math.floor(duration / 60) + 'm' + Utils.formatStringLength((duration % 60).toString(), 2, true, '0') + 's';
    }
    return duration + 's';
  }

  static rdm(arg1, arg2) {
    return Utils.random(arg1, arg2);
  }

  static random(arg1, arg2) {
    let min, max;
    if (arg2) {
      min = arg1;
      max = arg2;
    } else {
      min = 0;
      max = arg1 || 2;
    }
    return crypto.randomInt(min, max);
  }

  static randomItem(array) {
    let length = array.length;
    let randomIndex = Utils.random(length); // length - 1
    return array[randomIndex];
  }

  static firstLetterUpper(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Repeats a string.
   * @param {String} char(s)
   * @param {Number} number of times
   * @return {String} repeated string
   */
  static repeatString(string, times) {
    return Array(times + 1).join(string);
  }

  static formatStringLength(string, expectedLength, before, characterToFill) {
    characterToFill = characterToFill || ' ';
    let stringLength = string.length,
      stringFormated;
    if (stringLength >= expectedLength) {
      stringFormated = string.substring(0, expectedLength);
    } else {
      if (before) {
        stringFormated = Utils.repeatString(characterToFill, expectedLength - stringLength) + string;
      } else {
        stringFormated = string + Utils.repeatString(characterToFill, expectedLength - stringLength);
      }
    }
    return stringFormated;
  }

  /** Function to return true if one of string of stringArray is found in string param */
  static searchStringInArray(string, stringArray) {
    for (let i = 0; i < stringArray.length; i++) {
      if (stringArray[i].toLowerCase().indexOf(string.toLowerCase()) > -1) {
        return stringArray[i];
      }
    }
    return false;
  }

  /** Function to execute a shell command. Return a Promise */
  static execCmd(command, noLog) {
    return new Promise((resolve, reject) => {
      exec(command, { shell: true }, (err, stdout, stderr) => {
        if (err && !noLog) {
          log.error('execCmd', err, stderr);
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /** Function to calculate execution time of something */
  static executionTime(startTime) {
    return new Date() - startTime;
  }

  /** Function to return date time. Pattern: 'YDT' */
  static logTime(param, date) {
    if (typeof date === 'undefined') date = new Date();
    const D = date.getDate();
    const M = date.getMonth() + 1;
    const Y = date.getFullYear();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const x = date.getMilliseconds();
    let now = '';

    if (typeof param === 'undefined') param = DATE_TIMEDEFAULT_PATTERN;
    for (let i = 0; i < param.length; i++) {
      switch (param[i]) {
        case 'Y':
          now += Y;
          break;
        case 'M':
          now += (M < 10 ? '0' : '') + M;
          break;
        case 'D':
          now += (D < 10 ? '0' : '') + D;
          break;
        case 'h':
          now += (h < 10 ? '0' : '') + h;
          break;
        case 'm':
          now += (m < 10 ? '0' : '') + m;
          break;
        case 's':
          now += (s < 10 ? '0' : '') + s;
          break;
        case 'x':
          now += (x < 100 ? (x < 10 ? '00' : '0') : '') + x;
          break;
        default:
          now += param[i];
      }
    }
    return now;
  }

  /** Function to return seconds difference from now */
  static getSecondesDifferenceFromNow(givenDate) {
    if (!util.types.isDate(givenDate)) {
      log.error('Given date is not a valid Date instance', givenDate, typeof givenDate);
    }
    let diff = Math.abs(new Date() - givenDate);
    return Math.floor(diff / 1000);
  }

  static isWeekend(date) {
    if (!date) date = new Date();
    let day = date.getDay();
    return day === 6 || day === 0;
  }

  static getWeek(givenDate) {
    let date = givenDate instanceof Date ? new Date(givenDate) : new Date();
    let onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - onejan) / MILLISEC_IN_DAY + onejan.getDay() + 1) / 7);
  }
};

/** Function to repeat/concat a string */
String.prototype.repeat = function (num) {
  if (Number(num) && num > 0) return new Array(Math.abs(num) + 1).join(this);
  return '';
};
