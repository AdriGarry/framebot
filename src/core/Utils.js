#!/usr/bin/env node
'use strict';

// Utils static factory (shoud not require Odi.js || Flux.js)
var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename); // prévoir un fallback si log n'est pas dispo log.info()=>console.log()

var fs = require('fs');
var exec = require('child_process').exec;
// var spawn = require('child_process').spawn;
// var os = require('os');
// var util = require('util');

module.exports = {
	stackPosition: stackPosition,
	repeatString: repeatString,
	deleteFolderRecursive: deleteFolderRecursive,
	appendJsonFile: appendJsonFile,
	execCmd: execCmd,
	firstLetterUpper: firstLetterUpper,
	executionTime: executionTime,
	addPatternBefore: addPatternBefore,
	getJsonFileContent: getJsonFileContent,
	getMp3Duration: getMp3Duration,
	logTime: logTime,
	numberWithDot: numberWithDot,
	perCent: perCent,
	random: random,
	rdm: random,
	randomItem: randomItem,
	searchStringInArray: searchStringInArray,
	testConnexion: testConnexion
};

/**
 * Function to retreive stack position at runtime
 * @param {*} displayLine
 */
function stackPosition(displayLine) {
	let stack = new Error().stack;
	let data = /\/([a-z]+.js):(\d+)/.exec(stack);
	// console.log(stack);
	// console.log(data[1], data[2]);
	if (Array.isArray(data) && data[1]) {
		if (displayLine && data[2]) {
			return data[1] + ':' + data[2];
		}
		return data[1];
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
	return Array(times + 1).join(string);
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
function appendJsonFile(filePath, obj, callback) {
	var fileData,
		startTime = new Date();
	fs.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, 'utf8', function(err, data) {
				if (!data) console.error(data);
				else {
					fileData = JSON.parse(data);
					fileData.push(obj);
					fileData = JSON.stringify(fileData, null, 2)
						.replace(/\\/g, '')
						.replace(/\"{/g, '{')
						.replace(/\}"/g, '}');
					fs.writeFile(filePath, fileData, function(cb) {
						log.debug('file ' + filePath + ' modified in', executionTime(startTime) + 'ms');
					});
				}
			});
		} else {
			fileData = [];
			fileData.push(obj);
			fileData = JSON.stringify(fileData, null, 2)
				.replace(/\\/g, '')
				.replace(/\"{/g, '{')
				.replace(/\}"/g, '}');
			// log.debug(fileData);
			fs.writeFile(filePath, fileData, function() {
				log.debug('file ' + filePath + ' created in', executionTime(startTime) + 'ms');
			});
		}
	});
}

/** Function getJsonFileContent */
var fileNotFoundExceptions = ['/home/pi/odi/tmp/voicemail.json'];
function getJsonFileContent(filePath, callback) {
	log.debug('getJsonFileContent() ', filePath);
	fs.readFile(filePath, function(err, data) {
		if (err && err.code === 'ENOENT' && !searchStringInArray(filePath, fileNotFoundExceptions)) {
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
			// console.log('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		} else {
			//console.log('Odi is online   :');
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

/** Function to retreive mp3 file duration */
function getMp3Duration(mp3File, callback) {
	// log.info('getMp3Duration()', mp3File);
	// console.log('**mp3File', mp3File);
	execCmd('mplayer -ao null -identify -frames 0 ' + mp3File + ' 2>&1 | grep ID_LENGTH', function(data) {
		try {
			// log.INFO(data);
			if (data == '') {
				getMp3Duration(mp3File, callback);
			}
			var duration = data.split('=')[1].trim();
			// log.INFO(duration);
			callback(duration);
		} catch (err) {
			// Don't log error because the method will call itself until OK !
			// console.error('getMp3Duration error:', err);
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

function numberWithDot(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function perCent(value, total, precision) {
	return (value / total * 100).toFixed(precision | 2);
}

function random(arg1, arg2) {
	var min, max;
	if (arg2) {
		min = arg1;
		max = arg2;
	} else {
		min = 0;
		max = arg1 | 2;
	}
	return Math.floor(Math.random() * (max - min) + min);
}

function randomItem(array) {
	// log.DEBUG(array);
	var length = array.length;
	var randomIndex = random(length - 1);
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
}

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
	var date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

/*Object.prototype.toString = () => {
  var obj = this;
  // console.log(obj);
  var string = '';
  for (var prop in obj) {
    string = prop + '=' + obj[prop] + ' ';
  }
  return string;
  // var output = '';
  // for (var property in object) {
  //   output += property + ': ' + object[property]+'; ';
  // }
};*/
