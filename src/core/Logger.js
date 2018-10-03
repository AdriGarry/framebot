#!/usr/bin/env node
'use strict';

module.exports = Logger;

const util = require('util');

const LEVEL = { INFO: 'info', DEBUG: 'debug', TRACE: 'trace' };
const TIMEOUT = 15;
const TIMESTAMP_PATTERN = { NORMAL: 'D/M h:m:s', SLEEP: 'D/M_h:m:s' };

var Utils, Flux, timestamp;

var logLevel = LEVEL.INFO;

function Logger(filename, modeCore) {
	Utils = require(_PATH + 'src/core/Utils.js');
	Flux = require(_PATH + 'src/core/Flux.js');
	if (modeCore && modeCore == 'sleep') {
		timestamp = TIMESTAMP_PATTERN.SLEEP;
	} else {
		timestamp = TIMESTAMP_PATTERN.NORMAL;
	}
	filename = filename.match(/(\w*).js/g)[0];

	this.info = info;
	this.INFO = INFO;
	this.debug = debug;
	this.DEBUG = DEBUG;
	this.trace = trace;
	this.TRACE = TRACE;
	this.table = table;
	this.error = error;
	this.level = levelAccessor;
	return this;

	function levelAccessor(arg) {
		if (arg) {
			setLogLevel(arg);
		} else {
			return logLevel;
		}
	}

	function setLogLevel(arg) {
		let newLogLevel = String(arg).toLowerCase();
		logLevel = newLogLevel;
		// INFO();
		if (!Flux) Flux = require(_PATH + 'src/core/Flux.js');
		Flux.next('interface|runtime|update', {
			log: newLogLevel
		});
		INFO('--> Logger level set to:', logLevel);
		if (newLogLevel == LEVEL.DEBUG || newLogLevel == LEVEL.TRACE) {
			timeoutToInfoLevel(TIMEOUT);
		}
	}

	var cancelTimeout;
	function timeoutToInfoLevel(delay) {
		info('back to info level in', delay, 'min');
		clearTimeout(cancelTimeout);
		cancelTimeout = setTimeout(() => {
			levelAccessor() != LEVEL.INFO && levelAccessor(LEVEL.INFO);
			Flux.next('interface|runtime|update', { log: LEVEL.INFO });
			// }, delay * 60 * 1000);
		}, 10 * 1000);
	}

	/** Function to retreive stack position at runtime */
	// const FILE_LINE_REGEX = /\/([a-zA-Z]+.js):(\d+)/g;
	// const FILE_REGEX = /\/([a-zA-Z]+.js)/g;
	function stackPosition(displayLine) {
		let stack = new Error().stack;
		// let regex;
		// if (displayLine) regex = FILE_LINE_REGEX;
		// else regex = FILE_REGEX;
		// let data = /\/([a-z]+.js):(\d+)/.exec(stack);
		let data = stack.match(/([a-zA-Z]+.js):(\d+)/g);
		// console.log(stack);
		// console.log(data);
		return data[2];
		// if (Array.isArray(data) && data[1]) {
		// 	if (displayLine && data[2]) {
		// 		return data[1] + ':' + data[2];
		// 	}
		// 	return data[1];
		// }
		return '';
	}

	function formatLog(args) {
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

	function info() {
		console.log(Utils.logTime(timestamp), '[' + filename + ']', formatLog(arguments));
	}

	function INFO() {
		console.log(Utils.logTime(timestamp), '[' + filename.toUpperCase() + ']', formatLog(arguments).toUpperCase());
	}

	function debug() {
		if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE)
			console.log(Utils.logTime(timestamp), '[' + filename + ']\u2022', formatLog(arguments));
	}

	function DEBUG() {
		if (logLevel == LEVEL.DEBUG || logLevel == LEVEL.TRACE)
			console.log(
				Utils.logTime(timestamp),
				'[' + filename.toUpperCase() + ']\u2022',
				formatLog(arguments).toUpperCase()
			);
	}

	function trace() {
		if (logLevel == LEVEL.TRACE)
			console.log(Utils.logTime(timestamp), '[' + filename + ']\u2022\u2022', formatLog(arguments));
	}

	function TRACE() {
		if (logLevel == LEVEL.TRACE)
			console.log(
				Utils.logTime(timestamp),
				'[' + filename.toUpperCase() + ']\u2022\u2022',
				formatLog(arguments).toUpperCase()
			);
	}

	function error() {
		console.log('______________');
		console.error(Utils.logTime(timestamp), '[' + filename + ']', 'ERR >>', formatLog(arguments));
	}

	/** Function to array an object */
	function table(src, title, updatedEntries) {
		let datas = formatObjectToTable(src, updatedEntries);
		let tableSize = calculateTableSize(datas);
		let logArrayTitle = '';
		if (title) {
			logArrayTitle = '│  ' + title + ' '.repeat(tableSize.col1 + tableSize.col2 + 2 - title.length) + ' │';
			logArrayTitle += '\n' + '├' + '─'.repeat(tableSize.col1 + 2) + '┬' + '─'.repeat(tableSize.col2 + 2) + '┤\n';
		}
		let confTable = '┌' + '─'.repeat(tableSize.col1 + tableSize.col2 + 5) + '┐\n' + logArrayTitle;

		Object.keys(datas).forEach(function(key, index) {
			let data = datas[key];
			Object.keys(data).forEach(function(key2, index2) {
				let data2 = data[key2];
				if (index2 == 0) {
					confTable +=
						'│ ' +
						key +
						' '.repeat(tableSize.col1 - key.length) +
						' │ ' +
						data2 +
						' '.repeat(tableSize.col2 - data2.length) +
						' │\n';
				} else {
					confTable +=
						'│ ' + ' '.repeat(tableSize.col1) + ' │ ' + data2 + ' '.repeat(tableSize.col2 - data2.length) + ' │\n';
				}
			});
		});
		console.log(confTable + '└' + '─'.repeat(tableSize.col1 + 2) + '┴' + '─'.repeat(tableSize.col2 + 2) + '┘');
	}

	/** Return formated object */
	function formatObjectToTable(obj, updatedEntries) {
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
							datas[(updated ? '*' : '') + key] = [String(key2 + ': ' + getDataOrObject(data2))];
						} else if (Array.isArray(datas[(updated ? '*' : '') + key])) {
							datas[(updated ? '*' : '') + key].push(String(key2 + ': ' + getDataOrObject(data2)));
						}
					}
				});
			} else {
				datas[(updated ? '*' : '') + key] = [String(data)];
			}
		});
		return datas;
	}

	function getDataOrObject(data) {
		if (typeof data == 'object' && !Array.isArray(data)) {
			return util.inspect(data);
		} else {
			return data;
		}
	}

	/** Function to calculate array width */
	function calculateTableSize(datas) {
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
}
