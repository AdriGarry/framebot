#!/usr/bin/env node
'use strict';

const util = require('util');

const LEVEL = { INFO: 'info', DEBUG: 'debug', TRACE: 'trace' };
const TIMEOUT = 15;
const TIMESTAMP_PATTERN = { NORMAL: 'D/M h:m:s', SLEEP: 'D/M_h:m:s' };

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
		console.log(Utils.logTime(timestamp), '[' + Utils.filePosition(2) + ']', this._formatLog(arguments));
	}

	INFO() {
		console.log(
			Utils.logTime(timestamp),
			'[' + Utils.filePosition(2).toUpperCase() + ']',
			this._formatLog(arguments).toUpperCase()
		);
	}

	debug() {
		if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE)
			console.log(Utils.logTime(timestamp), '[' + Utils.filePosition(2) + ']\u2022', this._formatLog(arguments));
	}

	DEBUG() {
		if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE)
			console.log(
				Utils.logTime(timestamp),
				'[' + Utils.filePosition(2).toUpperCase() + ']\u2022',
				this._formatLog(arguments).toUpperCase()
			);
	}

	trace() {
		if (logLevel == LEVEL.TRACE)
			console.log(Utils.logTime(timestamp), '[' + Utils.filePosition(2) + ']\u2022\u2022', this._formatLog(arguments));
	}

	TRACE() {
		if (logLevel == LEVEL.TRACE)
			console.log(
				Utils.logTime(timestamp),
				'[' + Utils.filePosition(2).toUpperCase() + ']\u2022\u2022',
				this._formatLog(arguments).toUpperCase()
			);
	}

	error() {
		console.log('______________');
		console.error(Utils.logTime(timestamp), '[' + Utils.filePosition(2) + ']', this._formatLog(arguments));
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
		this.info();
		this.INFO('--> Logger level set to:', logLevel);
		if (newLogLevel == LEVEL.DEBUG || newLogLevel == LEVEL.TRACE) {
			this._timeoutToInfoLevel(TIMEOUT);
		}
	}

	_timeoutToInfoLevel(delay) {
		this.info('back to info level in', delay, 'min');
		clearTimeout(cancelTimeout);
		cancelTimeout = setTimeout(() => {
			this.level() != LEVEL.INFO && this.level(LEVEL.INFO);
			Core.conf('log', LEVEL.INFO);
		}, delay * 60 * 1000);
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
