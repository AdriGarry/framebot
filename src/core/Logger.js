#!/usr/bin/env node
'use strict';

const util = require('util');

const LEVEL = { INFO: 'info', DEBUG: 'debug', TRACE: 'trace' },
	TIMEOUT_MIN = 60,
	LOG_LEVEL_LENGTH = 5,
	FILE_POSITION_LENGTH = 12,
	TIMESTAMP_PATTERN = { NORMAL: 'D/M h:m:s,x', SLEEP: 'D/M_h:m:s,x' };

var Utils, Core, timestamp, cancelTimeout;

var logLevel = LEVEL.INFO;

module.exports = class Logger {
	constructor(filename, modeCore) {
		Utils = require(_PATH + 'src/core/Utils.js');
		if (modeCore && modeCore == 'sleep') {
			timestamp = TIMESTAMP_PATTERN.SLEEP;
		} else {
			timestamp = TIMESTAMP_PATTERN.NORMAL;
		}
		this.filename = filename.match(/(\w*).js/g)[0];
	}

	level(arg) {
		if (arg) {
			this._setLogLevel(arg);
		} else {
			return logLevel;
		}
	}

	info() {
		console.log(this._formatLogPrefix('info'), this._formatLog(arguments));
	}

	INFO() {
		console.log(this._formatLogPrefix('INFO'), this._formatLog(arguments).toUpperCase());
	}

	debug() {
		if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE)
			console.log(this._formatLogPrefix('debug'), this._formatLog(arguments));
	}

	DEBUG() {
		if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE)
			console.log(this._formatLogPrefix('DEBUG'), this._formatLog(arguments).toUpperCase());
	}

	trace() {
		if (logLevel == LEVEL.TRACE) console.log(this._formatLogPrefix('trace'), this._formatLog(arguments));
	}

	TRACE() {
		if (logLevel == LEVEL.TRACE) console.log(this._formatLogPrefix('TRACE'), this._formatLog(arguments).toUpperCase());
	}

	warn() {
		console.log(this._formatLogPrefix('WARN'), this._formatLog(arguments).toUpperCase());
	}

	error() {
		console.log('______________');
		console.error(this._formatLogPrefix('error'), this._formatLog(arguments));
	}

	table(src, title, updatedEntries) {
		let datas = this._formatObjectToTable(src, updatedEntries);
		let tableSize = this._calculateTableSize(datas);
		let logArrayTitle = '';
		if (title) {
			logArrayTitle = '│  ' + title + ' '.repeat(tableSize.col1 + tableSize.col2 + 2 - title.length) + ' │';
			logArrayTitle += '\n' + '├' + '─'.repeat(tableSize.col1 + 2) + '┬' + '─'.repeat(tableSize.col2 + 2) + '┤\n';
		}
		let table = '┌' + '─'.repeat(tableSize.col1 + tableSize.col2 + 5) + '┐\n' + logArrayTitle;

		Object.keys(datas).forEach(function(key, index) {
			let data = datas[key];
			Object.keys(data).forEach(function(key2, index2) {
				let data2 = data[key2];
				if (index2 == 0) {
					table +=
						'│ ' +
						key +
						' '.repeat(tableSize.col1 - key.length) +
						' │ ' +
						data2 +
						' '.repeat(tableSize.col2 - data2.length) +
						' │\n';
				} else {
					table +=
						'│ ' + ' '.repeat(tableSize.col1) + ' │ ' + data2 + ' '.repeat(tableSize.col2 - data2.length) + ' │\n';
				}
			});
		});
		console.log(table + '└' + '─'.repeat(tableSize.col1 + 2) + '┴' + '─'.repeat(tableSize.col2 + 2) + '┘');
	}

	_setLogLevel(arg) {
		let newLogLevel = String(arg).toLowerCase();
		logLevel = newLogLevel;
		Core = require(_PATH + 'src/core/Core.js').Core;
		Core.conf('log', logLevel);
		this.INFO('--> Logger level set to:', logLevel);
		if (newLogLevel == LEVEL.DEBUG || newLogLevel == LEVEL.TRACE) {
			this._timeoutToInfoLevel(TIMEOUT_MIN);
		}
	}

	_timeoutToInfoLevel(delay) {
		this[logLevel]('back to info level in', delay, 'min');
		clearTimeout(cancelTimeout);
		cancelTimeout = setTimeout(() => {
			this.level() != LEVEL.INFO && this.level(LEVEL.INFO);
			Core.conf('log', LEVEL.INFO);
		}, delay * 60 * 1000);
	}

	_formatLogPrefix(logLevel) {
		return Utils.logTime(timestamp) + this._formatLogLevel(logLevel) + this._formatLogPosition() + ' |';
	}

	_formatLogLevel(logLevel) {
		return ' | ' + Utils.formatStringLength(logLevel, LOG_LEVEL_LENGTH) + ' | ';
	}

	_formatLogPosition() {
		let codePosition = Utils.codePosition(4);
		let file = Utils.formatStringLength(
			codePosition.file,
			FILE_POSITION_LENGTH - codePosition.line.toString().length - 1,
			true
		);
		return Utils.formatStringLength(file + ':' + codePosition.line, FILE_POSITION_LENGTH, true);
	}

	_formatLog(args) {
		if (typeof args === 'string') {
			return args;
		}
		var log = '';
		if (args[0] == '\n') {
			console.log('');
			delete args[0];
		}
		for (var i in args) {
			if (typeof args[i] == 'object') {
				log = log + util.format(util.inspect(args[i]) + ' ');
			} else {
				log = log + args[i] + ' ';
			}
		}
		return log;
	}

	_formatObjectToTable(obj, updatedEntries) {
		let datas = {};
		Object.keys(obj).forEach((key, index) => {
			let updated = updatedEntries && Utils.searchStringInArray(key, updatedEntries) ? true : false;
			let data = obj[key];
			if (data == false || data == null || data == 0) return;
			if (typeof data == 'object' && !Array.isArray(data)) {
				Object.keys(data).forEach((key2, index2) => {
					let data2 = data[key2];
					if (data2) {
						// not logging null entries
						if (index2 == 0) {
							datas[(updated ? '*' : '') + key] = [String(key2 + ': ' + this._getDataOrObject(data2))];
						} else if (Array.isArray(datas[(updated ? '*' : '') + key])) {
							datas[(updated ? '*' : '') + key].push(String(key2 + ': ' + this._getDataOrObject(data2)));
						}
					}
				});
			} else {
				datas[(updated ? '*' : '') + key] = [String(data)];
			}
		});
		return datas;
	}

	_getDataOrObject(data) {
		if (typeof data == 'object' && !Array.isArray(data)) {
			return util.inspect(data);
		} else {
			return data;
		}
	}

	_calculateTableSize(datas) {
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
		return tableSize;
	}
};
