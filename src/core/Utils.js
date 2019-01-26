#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const fs = require('fs');

// Utils static factory (shoud not require Core.js || Flux.js)
const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);

module.exports = {
	//array
	randomItem: randomItem,
	searchStringInArray: searchStringInArray,

	//custom/execution/all
	logTime: logTime,
	codePosition: codePosition,
	execCmd: execCmd,
	executionTime: executionTime,
	testConnexion: testConnexion,

	//file
	getJsonFileContent: getJsonFileContent,
	getAbsolutePath: getAbsolutePath,
	getSoundDuration: getSoundDuration,
	deleteFolderRecursive: deleteFolderRecursive,
	appendJsonFile: appendArrayInJsonFile,
	directoryContent: directoryContent,

	//number
	numberWithDot: numberWithDot,
	perCent: perCent,
	random: random,
	rdm: random,

	//string
	repeatString: repeatString,
	formatStringLength: formatStringLength,
	firstLetterUpper: firstLetterUpper,
	capitalizeFirstLetter: capitalizeFirstLetter,
	formatDuration: formatDuration,
	addPatternBefore: addPatternBefore
};

/**
 * Function to retreive code position (file & line) at runtime
 * @param {*} steps
 */
function codePosition(steps) {
	let stack = new Error().stack;
	// console.log(stack);
	let data = stack.match(/([a-zA-Z]+.js:\d+)/gm);
	if (isNaN(steps)) steps = 0;
	if (Array.isArray(data) && data[steps]) {
		let result = data[steps].split(':');
		return { file: result[0], line: result[1] };
	}
	return '';
}

/**
 * Repeats a string.
 * @param {String} char(s)
 * @param {Number} number of times
 * @return {String} repeated string
 */
function repeatString(string, times) {
	// console.log('repeatString', string, times);
	return Array(times + 1).join(string);
}

function formatStringLength(string, expectedLength, before) {
	let stringLength = string.length,
		stringFormated;
	if (stringLength >= expectedLength) {
		stringFormated = string.substring(0, expectedLength);
		// console.log(stringLength, 'if', stringFormated);
	} else {
		if (before) {
			stringFormated = repeatString(' ', expectedLength - stringLength) + string;
		} else {
			stringFormated = string + repeatString(' ', expectedLength - stringLength);
		}
		// stringFormated = string + repeatString(' ', Math.abs(stringLength - expectedLength) + 2);
		// console.log(stringLength, 'else', stringFormated);
	}
	return stringFormated;
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

/** Function to append object in JSON file */
function appendArrayInJsonFile(filePath, obj, callback) {
	var fileData,
		startTime = new Date();
	fs.exists(filePath, function(exists) {
		try {
			if (exists) {
				fs.readFile(filePath, 'utf8', function(err, data) {
					if (!data) {
						fileData = [];
					} else {
						fileData = JSON.parse(data);
					}
					if (Array.isArray(fileData)) {
						fileData.push(obj);
						_writeFile(filePath, fileData, startTime);
					} else {
						fileData = [fileData];
						fileData.push(obj);
						_writeFile(filePath, fileData, startTime);
					}
				});
			} else {
				fileData = [obj];
				_writeFile(filePath, fileData, startTime, true);
			}
		} catch (err) {
			console.error('Utils.appendArrayInJsonFile error', err);
		}
	});
}

function directoryContent(path) {
	return new Promise((resolve, reject) => {
		fs.readdir(path, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

function _writeFile(filePath, fileData, startTime, isCreation) {
	var jsonData = JSON.stringify(fileData, null, 2)
		.replace(/\\/g, '')
		.replace(/\"{/g, '{')
		.replace(/\}"/g, '}');
	fs.writeFile(filePath, jsonData, function() {
		//{ mode: '666' } // { mode: parseInt('0777', 8) }
		if (isCreation) {
			log.debug('file ' + filePath + ' created in', executionTime(startTime) + 'ms');
		} else {
			log.debug('file ' + filePath + ' modified in', executionTime(startTime) + 'ms');
		}
	});
}

/** Function getJsonFileContent */
const FILE_NOT_FOUND_EXCEPT = ['/home/pi/core/tmp/voicemail.json', '/home/pi/core/tmp/record.json'];
function getJsonFileContent(filePath, callback) {
	log.debug('getJsonFileContent() ', filePath);
	fs.readFile(filePath, function(err, data) {
		if (err && err.code === 'ENOENT' && !searchStringInArray(filePath, FILE_NOT_FOUND_EXCEPT)) {
			log.error('No file: ' + filePath);
			callback(null);
		} else {
			callback(data);
		}
	});
}

/** Function to return true if one of string of stringArray is found in string param */
function searchStringInArray(string, stringArray) {
	for (var i = 0; i < stringArray.length; i++) {
		if (stringArray[i].toLowerCase().indexOf(string.toLowerCase()) > -1) {
			// if (string.toLowerCase().search(stringArray[i].toLowerCase()) > -1) {
			//return true;
			return stringArray[i];
		}
	}
	return false;
}

/** Function to test internet connexion */
function testConnexion(callback) {
	//console.log('testConnexion()...');
	require('dns').resolve('www.google.com', function(err) {
		if (err) {
			log.debug('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		} else {
			log.debug('Odi is online!');
			callback(true);
		}
	});
}

/** Function to execute a shell command with callback */
function execCmd(command, callback) {
	exec(command, function(error, stdout, stderr) {
		// console.log('execCmd(' + command + ')\n', stdout);
		// if (stderr) callback(stderr);
		if (callback) callback(stdout);
	});
}

function getAbsolutePath(path, prefix) {
	if (typeof path !== 'string') {
		log.error('Path must be a string: ' + typeof path, path);
		// new CoreError(label, path);
		return false;
	}
	if (path.indexOf('/home') === -1) {
		path = prefix + path;
	}

	if (!fs.existsSync(path)) {
		log.error('Wrong file path', path);
		// new CoreError(label, path);
		return false;
	}
	return path;
}

/** Function to retreive mp3 file duration */
function getSoundDuration(soundFile, callback) {
	// log.info('getSoundDuration()', mp3File);
	// console.log('**soundFile', soundFile);
	execCmd('mplayer -ao null -identify -frames 0 ' + soundFile + ' 2>&1 | grep ID_LENGTH', function(data) {
		try {
			// log.INFO(data);
			if (data == '') {
				getSoundDuration(soundFile, callback);
			}
			var duration = data.split('=')[1].trim();
			// log.INFO(duration);
			callback(parseInt(duration));
		} catch (err) {
			// Don't log error because the method will call itself until OK !
			// console.error('getSoundDuration error:', err);
		}
	});
}

function firstLetterUpper(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/** Function to repeat/concat a string */
String.prototype.repeat = function(num) {
	if (Number(num)) return new Array(Math.abs(num) + 1).join(this);
	return '';
};

/** Function to remove quotes in a string */
String.prototype.unQuote = function() {
	return this.replace(/'|"/gm, '');
};

/** Function to calculate execution time of something */
function executionTime(startTime, formatResultPattern) {
	var length = 4;
	var elapsedTime = new Date() - startTime;
	if (formatResultPattern) {
		return addPatternBefore(elapsedTime, formatResultPattern);
	}
	return elapsedTime;
}

function addPatternBefore(time, pattern) {
	if (typeof pattern == 'string') {
		return pattern.charAt(0).repeat(pattern.length - time.toString().length) + time;
	}
	return time;
}

function formatDuration(duration) {
	duration = parseInt(duration);
	if (duration > 120) {
		return Math.round(duration / 60) + 'm' + (duration % 60) + 's';
	}
	return duration + 's';
}

function numberWithDot(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function perCent(value, total, precision) {
	return ((value / total) * 100).toFixed(precision | 2);
}

function random(arg1, arg2) {
	var min, max;
	if (arg2) {
		min = arg1;
		max = arg2;
	} else {
		min = 0;
		max = arg1 || 2;
	}
	return Math.floor(Math.random() * (max - min) + min);
}

function randomItem(array) {
	// log.DEBUG(array);
	var length = array.length;
	var randomIndex = random(length); //length - 1
	// log.DEBUG('----------randomIndex', randomIndex);
	return array[randomIndex];
}

/** Function to return date time. Pattern: 'YDT' */
const dateTimeDefaultPattern = 'D/M h:m:s';
function logTime(param, date) {
	if (typeof date === 'undefined') date = new Date();
	var D = date.getDate();
	var M = date.getMonth() + 1;
	var Y = date.getFullYear();
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var x = date.getMilliseconds();
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
			case 'x':
				now += (x < 100 ? (x < 10 ? '00' : '0') : '') + x;
				break;
			default:
				now += param[i];
		}
	}
	return now;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
	var date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};
