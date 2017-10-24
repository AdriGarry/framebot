#!/usr/bin/env node
'use strict';

var util = require('util');

module.exports = Logger;

const dateTimeDefaultPattern = 'D/M h:m:s';
var modeDebug = false,
	Utils;

function Logger(filename, debugMode, dateTimePattern) {
	Utils = require(ODI_PATH + 'src/core/Utils.js');
	// console.log(Utils);
	modeDebug = debugMode || modeDebug;
	// dateTimePattern = dateTimePattern || dateTimeDefaultPattern;
	filename = filename.match(/(\w*).js/g)[0];
	// debug("Logger init [" + filename + "]");

	this.info = info;
	this.INFO = INFO;
	this.enableDebug = enableDebug;
	this.debug = debug;
	this.DEBUG = DEBUG;
	this.error = error;
	//this.logTime = logTime;
	return this;

	function enableDebug() {
		modeDebug = true;
	}

	function formatLog(args) {
		if (typeof args === 'string') {
			return args;
		}
		var log = '';
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
		// console.log(Utils);
		console.log(Utils.logTime(), '[' + filename + ']', formatLog(arguments));
	}

	function INFO() {
		console.log(Utils.logTime(), '[' + filename.toUpperCase() + ']', formatLog(arguments).toUpperCase());
	}

	function debug() {
		if (!modeDebug) return;
		console.log(Utils.logTime(), '[' + filename + ']\u2022', formatLog(arguments));
	}

	function DEBUG() {
		if (!modeDebug) return;
		console.log(Utils.logTime(), '[' + filename.toUpperCase() + ']\u2022', formatLog(arguments).toUpperCase());
	}

	function error() {
		console.log('___________________');
		console.error(/*'\n' +*/ Utils.logTime(), '[' + filename + ']', '>> ERR_', formatLog(arguments));
	}

	/** Function to return date time. Pattern: 'YDT' */
	/*function logTime(param, date) {
		if (typeof date === 'undefined') date = new Date();
		var D = date.getDate();
		var M = date.getMonth() + 1;
		var Y = date.getFullYear();
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		var now = '';

		if (typeof param === 'undefined') param = dateTimeDefaultPattern;
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
  }*/
}
