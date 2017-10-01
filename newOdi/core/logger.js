#!/usr/bin/env node
'use strict'

var util = require('util');

module.exports = Logger;

const dateTimeDefaultPattern = 'D/M h:m:s';
var modeDebug = false;

function Logger(filename, debugMode, dateTimePattern) {
	modeDebug = debugMode || modeDebug;
	// console.log('Logger.debugMode:', debugMode, 'Logger.modeDebug:', modeDebug);
	dateTimePattern = dateTimePattern || dateTimeDefaultPattern;
	filename = filename.match(/(\w*).js/g)[0];
	// debug('Logger init [' + filename + ', debug=' + modeDebug + ']');
	debug('Logger init [' + filename + (modeDebug ? ', debug]' : ']'));

	this.info = info;
	// console.log('--debugMode', modeDebug);
	this.debug = debug;
	this.error = error;
	this.logTime = logTime;
	return this;

	function info() {
		var log = '';
		for (var i in arguments) {
			if (typeof arguments[i] == 'object') {
				log = log + ' ' + util.format(util.inspect(arguments[i]));
			} else {
				log = log + ' ' + arguments[i];
			}
		}
		console.log(logTime(), '[' + filename + ']', log);
	};

	function debug() {
		if (!modeDebug) return;
		var log = '\u2022';
		for (var i in arguments) {
			if (typeof arguments[i] == 'object') {
				log = log + ' ' + util.format(util.inspect(arguments[i]));
			} else {
				log = log + ' ' + arguments[i];
			}
		}
		console.log(logTime(), '[' + filename + ']', log);
	};

	function error() {
		var log = '';
		for (var i in arguments) {
			if (typeof arguments[i] == 'object') {
				log = log + ' ' + util.format(util.inspect(arguments[i]));
			} else {
				log = log + ' ' + arguments[i];
			}
		}
		console.error('\r\n' + logTime(), '[' + filename + ']', '>> ERR_', log);
	};

	/** Function to return date time. Pattern: 'YDT' */
	function logTime(param, date) {
		if (typeof date === 'undefined') date = new Date();
		var D = date.getDate();
		var M = date.getMonth() + 1;
		var Y = date.getFullYear();
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		var now = '';

		if (typeof param === 'undefined') param = dateTimePattern;
		for (var i = 0; i < param.length; i++) {
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
				default:
					now += param[i];
			}
		}
		return now;
	};
};
