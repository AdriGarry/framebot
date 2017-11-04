#!/usr/bin/env node
'use strict';

var util = require('util');

module.exports = Logger;

const dateTimeDefaultPattern = 'D/M h:m:s';
var Odi, Utils, modeDebug = false;

function Logger(filename, debugMode, dateTimePattern) {
	Utils = require(ODI_PATH + 'src/core/Utils.js');
	Odi = require(ODI_PATH + 'src/core/Odi.js');
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
	return this;

	function enableDebug() {
		modeDebug = true;
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
}
