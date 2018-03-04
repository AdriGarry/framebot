#!/usr/bin/env node
'use strict';

var util = require('util');

module.exports = Logger;

const DATE_TIME_DEFAULT_PATTERN = 'D/M h:m:s';
var Odi,
	Utils,
	modeDebug = false,
	modeFlag = '';

function Logger(filename, debugMode, mode) {
	Utils = require(ODI_PATH + 'src/core/Utils.js');
	Odi = require(ODI_PATH + 'src/core/Odi.js');
	modeDebug = debugMode || modeDebug;
	if (mode && mode == 'sleep') {
		modeFlag = '.';
	}
	filename = filename.match(/(\w*).js/g)[0];

	this.info = info;
	this.INFO = INFO;
	this.enableDebug = enableDebug;
	this.debug = debug;
	this.DEBUG = DEBUG;
	this.table = table;
	this.error = error;
	return this;

	function enableDebug() {
		modeDebug = true;
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
		console.log(Utils.logTime(), modeFlag + '[' + filename + ']', formatLog(arguments));
	}

	function INFO() {
		console.log(Utils.logTime(), modeFlag + '[' + filename.toUpperCase() + ']', formatLog(arguments).toUpperCase());
	}

	function debug() {
		if (!modeDebug) return;
		console.log(Utils.logTime(), modeFlag + '[' + filename + ']\u2022', formatLog(arguments));
	}

	function DEBUG() {
		if (!modeDebug) return;
		console.log(
			Utils.logTime(),
			modeFlag + '[' + filename.toUpperCase() + ']\u2022',
			formatLog(arguments).toUpperCase()
		);
	}

	function error() {
		console.log('______________');
		console.error(Utils.logTime(), modeFlag + '[' + filename + ']', 'ERR >>', formatLog(arguments));
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
							datas[key] = [String(key2 + ': ' + getDataOrObject(data2))];
						} else if (Array.isArray(datas[key])) {
							datas[key].push(String(key2 + ': ' + getDataOrObject(data2)));
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

	/** Function to array an object */
	function tableOld(src, title, updatedEntries) {
		var col1 = 11,
			col2 = 16;
		var logArrayTitle = '';
		if (title) {
			logArrayTitle = '│  ' + title + ' '.repeat(col1 + col2 + 2 - title.length) + ' │';
			logArrayTitle += '\n' + '├' + '─'.repeat(13) + '┬' + '─'.repeat(18) + '┤\n';
		}
		var confArray = '┌' + '─'.repeat(32) + '┐\n' + logArrayTitle;
		Object.keys(src).forEach(function(key, index) {
			if (key == 'alarms') {
				Object.keys(src[key]).forEach(function(key2, index2) {
					if (key2 != 'd') {
						var c1 = index2 > 0 ? ' '.repeat(col1) : key + ' '.repeat(col1 - key.toString().length);
						var c2 = key2 + ' ' + (src[key][key2].h < 10 ? ' ' : '') + src[key][key2].h + ':';
						c2 += (src[key][key2].m < 10 ? '0' : '') + src[key][key2].m;
						if (typeof src[key][key2].mode === 'string') c2 += ' ' + src[key][key2].mode.charAt(0); //String(src[key][key2].mode).charAt(0)
						confArray += '│ ' + c1 + ' │ ' + c2 + ' '.repeat(col2 - c2.length) + ' │\n';
					}
				});
			} else {
				var updated = updatedEntries && Utils.searchStringInArray(key, updatedEntries) ? true : false;
				var value;
				if (src[key] == null) value = 'null';
				else if (typeof src[key] == 'object' && !Array.isArray(src[key]))
					value = Object.keys(src[key]).map(k => src[key][k]);
				else value = src[key];
				confArray +=
					'│ ' +
					(!updated ? '' : '*') +
					key +
					' '.repeat(col1 - key.length - updated) /*(updatedEntries.indexOf(key) == -1 ? ' ' : '*')*/ +
					' │ ' +
					value +
					' '.repeat(col2 - value.toString().length) +
					' │\n';
			}
		});
		console.log(confArray + '└' + '─'.repeat(13) + '┴' + '─'.repeat(18) + '┘');
	}
}
