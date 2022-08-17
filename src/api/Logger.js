#!/usr/bin/env node
'use strict';

const util = require('util');

const LEVEL = { INFO: 'info', DEBUG: 'debug', TRACE: 'trace' },
  TIMEOUT_MIN = 60,
  LOG_LEVEL_LENGTH = 5,
  FILE_POSITION_LENGTH = 12,
  TIMESTAMP_PATTERN = { NORMAL: 'D/M h:m:s,x', SLEEP: 'D/M_h:m:s,x' };

let Utils, Core, timestamp, cancelTimeout;

let logLevel = LEVEL.INFO;

module.exports = class Logger {
  constructor(filename, modeCore) {
    Utils = require('./Utils');
    if (modeCore && modeCore == 'sleep') {
      timestamp = TIMESTAMP_PATTERN.SLEEP;
    } else {
      timestamp = TIMESTAMP_PATTERN.NORMAL;
    }
    this.filename = filename.match(/(\w*).js/g)[0];
  }

  level(arg) {
    if (arg) {
      let newLogLevel = String(arg).toLowerCase();
      logLevel = newLogLevel;
      Core = require(_PATH + 'src/core/Core.js').api;
      Core.conf('log', logLevel);
      this.INFO('Logger level set to:', logLevel);
      if (newLogLevel == LEVEL.DEBUG || newLogLevel == LEVEL.TRACE) {
        _timeoutToInfoLevel(this, TIMEOUT_MIN);
      }
    } else {
      return logLevel;
    }
  }

  info() {
    console.log(_formatLogPrefix('info'), _formatLog(arguments));
  }

  INFO() {
    console.log(_formatLogPrefix('INFO'), _formatLog(arguments).toUpperCase());
  }

  debug() {
    if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE) console.log(_formatLogPrefix('debug'), _formatLog(arguments));
  }

  DEBUG() {
    if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE) console.log(_formatLogPrefix('DEBUG'), _formatLog(arguments).toUpperCase());
  }

  trace() {
    if (logLevel == LEVEL.TRACE) console.log(_formatLogPrefix('trace'), _formatLog(arguments));
  }

  TRACE() {
    if (logLevel == LEVEL.TRACE) console.log(_formatLogPrefix('TRACE'), _formatLog(arguments).toUpperCase());
  }

  test() {
    console.log(_formatLogPrefix('TEST!', '-->'), _formatLog(arguments));
  }

  warn() {
    console.log(_formatLogPrefix('warn'), _formatLog(arguments));
  }

  WARN() {
    console.log(_formatLogPrefix('WARN'), _formatLog(arguments).toUpperCase());
  }

  error() {
    console.log('______________');
    console.error(_formatLogPrefix('error'), _formatLog(arguments));
  }

  table(src, title, updatedEntries) {
    let datas = _formatObjectToTable(src, updatedEntries);
    let tableSize = _calculateTableSize(datas);
    let logArrayTitle = '';
    if (title) {
      logArrayTitle = '│  ' + title + ' '.repeat(tableSize.col1 + tableSize.col2 + 2 - title.length) + ' │';
      logArrayTitle += '\n' + '├' + '─'.repeat(tableSize.col1 + 2) + '┬' + '─'.repeat(tableSize.col2 + 2) + '┤\n';
    }
    let table = '┌' + '─'.repeat(tableSize.col1 + tableSize.col2 + 5) + '┐\n' + logArrayTitle;

    Object.keys(datas).forEach(function (key) {
      let data = datas[key];
      Object.keys(data).forEach(function (key2, index) {
        let data2 = data[key2];
        if (index == 0) {
          table += '│ ' + key + ' '.repeat(tableSize.col1 - key.length) + ' │ ' + data2 + ' '.repeat(tableSize.col2 - data2.length) + ' │\n';
        } else {
          table += '│ ' + ' '.repeat(tableSize.col1) + ' │ ' + data2 + ' '.repeat(tableSize.col2 - data2.length) + ' │\n';
        }
      });
    });
    console.log(table + '└' + '─'.repeat(tableSize.col1 + 2) + '┴' + '─'.repeat(tableSize.col2 + 2) + '┘');
  }
};

function _timeoutToInfoLevel(_instance, delay) {
  _instance[logLevel]('back to info in', delay, 'min');
  clearTimeout(cancelTimeout);
  cancelTimeout = setTimeout(() => {
    _instance.level() != LEVEL.INFO && _instance.level(LEVEL.INFO);
    Core.conf('log', LEVEL.INFO);
  }, delay * 60 * 1000);
}

function _formatLogPrefix(logLevelArg, sufix) {
  return Utils.logTime(timestamp) + _formatLogLevel(logLevelArg) + _formatLogPosition() + ' |' + (sufix ? sufix : '');
}

function _formatLogLevel(logLevelArg) {
  return ' | ' + Utils.formatStringLength(logLevelArg, LOG_LEVEL_LENGTH) + ' | ';
}

function _formatLogPosition() {
  let codePosition = getCodePosition(4);
  let file = Utils.formatStringLength(codePosition.file, FILE_POSITION_LENGTH - codePosition.line.toString().length - 1, true);
  return Utils.formatStringLength(file + ':' + codePosition.line, FILE_POSITION_LENGTH, true);
}

function _formatLog(args) {
  if (typeof args === 'string') {
    return args;
  }
  let log = '';
  if (args[0] === '\n') {
    console.log('');
    delete args[0];
  }
  for (let i in args) {
    if (typeof args[i] == 'object') {
      log = log + util.format(util.inspect(args[i]) + ' ');
    } else {
      log = log + args[i] + ' ';
    }
  }
  return log;
}

function _formatObjectToTable(obj, updatedEntries) {
  let datas = {};
  Object.keys(obj).forEach(key => {
    let updated = updatedEntries && Utils.searchStringInArray(key, updatedEntries) ? true : false;
    let data = obj[key];
    if (!data || data == null || data === 0) return;
    if (typeof data == 'object' && !Array.isArray(data)) {
      if (Object.prototype.toString.call(data) === '[object Date]') {
        datas['' + key] = [String(data.toString().substring(0, 24))];
      } else {
        Object.keys(data).forEach((key2, index) => {
          let data2 = data[key2];
          if (data2) {
            // not logging null entries
            if (index == 0) {
              datas[(updated ? '*' : '') + key] = [String(key2 + ': ' + _getDataOrObject(data2))];
            } else if (Array.isArray(datas[(updated ? '*' : '') + key])) {
              datas[(updated ? '*' : '') + key].push(String(key2 + ': ' + _getDataOrObject(data2)));
            }
          }
        });
      }
    } else if (Array.isArray(data)) {
      datas[(updated ? '*' : '') + key] = data;
    } else {
      datas[(updated ? '*' : '') + key] = [String(data)];
    }
  });
  return datas;
}

function _getDataOrObject(data) {
  if (typeof data === 'object' && !Array.isArray(data)) {
    return util.inspect(data);
  } else if (typeof data === 'object' && data.length > 2) {
    return data.length + ' items';
  } else {
    return data;
  }
}

function _calculateTableSize(datas) {
  let tableSize = { col1: [], col2: [] };
  Object.keys(datas).forEach(key => {
    tableSize.col1.push(key.length);
    tableSize.col2.push(
      Math.max.apply(
        Math,
        datas[key].map(el => {
          return el.length;
        })
      )
    );
  });
  tableSize.col1 = Math.max.apply(
    Math,
    tableSize.col1.map(el => {
      return el;
    })
  );
  tableSize.col2 = Math.max.apply(
    Math,
    tableSize.col2.map(el => {
      return el;
    })
  );
  if (tableSize.col1 == '-Infinity' || tableSize.col2 == '-Infinity') tableSize = { col1: 2, col2: 2 };
  return tableSize;
}

/** Function to retreive code position (file & line) at runtime */
function getCodePosition(steps) {
  let stack = new Error().stack;
  let data = stack.match(/([a-zA-Z]+.js:\d+)/gm);
  if (isNaN(steps)) steps = 0;
  if (Array.isArray(data) && data[steps]) {
    let result = data[steps].split(':');
    return { file: result[0], line: result[1] };
  }
  return { file: '', line: '' };
}
