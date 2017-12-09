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
	repeatString: repeatString,
	appendJsonFile: appendJsonFile,
	execCmd: execCmd,
	firstLetterUpper: firstLetterUpper,
	getExecutionTime: getExecutionTime,
	addPatternBefore: addPatternBefore,
	getJsonFileContent: getJsonFileContent,
	getMp3Duration: getMp3Duration,
	logTime: logTime,
	numberWithDot: numberWithDot,
	random: random,
	randomItem: randomItem,
	searchStringInArray: searchStringInArray,
	testConnexion: testConnexion
};

/**
 * Repeats a string.
 * @param {String} char(s)
 * @param {Number} number of times
 * @return {String} repeated string
 */
function repeatString(string, times) {
	return Array(times + 1).join(string);
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
					// log.debug('fileData', fileData);
					fs.writeFile(filePath, fileData, function(cb) {
						log.debug('file ' + filePath + ' modified in', getExecutionTime(startTime) + 'ms');
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
				log.debug('file ' + filePath + ' created in', getExecutionTime(startTime) + 'ms');
			});
		}
	});
}

/** Function getJsonFileContent */
var fileNotFoundExceptions = ['voicemail.js'];
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
		if (string.toLowerCase().search(stringArray[i].toLowerCase()) > -1) {
			return true;
		}
	}
	return false;
}

/** Function to test internet connexion */
function testConnexion(callback) {
	//console.debug('testConnexion()...');
	require('dns').resolve('www.google.com', function(err) {
		if (err) {
			// console.debug('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		} else {
			//console.debug('Odi is online   :');
			callback(true);
		}
	});
}

/** Function to execute a shell command with callback */
function execCmd(command, callback) {
	exec(command, function(error, stdout, stderr) {
		// console.debug('execCmd(' + command + ')\n', stdout);
		if (callback) callback(stdout);
	});
}

/** Function to retreive mp3 file duration */
function getMp3Duration(mp3File, callback) {
	// log.info('getMp3Duration()', mp3File);
	console.log('**mp3File', mp3File);
	execCmd('mplayer -ao null -identify -frames 0 ' + mp3File + ' 2>&1 | grep ID_LENGTH', function(data) {
		try {
			log.INFO(data);
			var duration = data.split('=')[1].trim();
			log.INFO(duration);
			callback(duration);
		} catch (err) {
			console.error('getMp3Duration error', err);
		}
	});
}

function firstLetterUpper(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/** Function to repeat/concat a string */
String.prototype.repeat = function(num) {
	return new Array(Math.abs(num) + 1).join(this);
};

/** Function to calculate execution time of something */
function getExecutionTime(startTime, formatResultPattern) {
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

// function random(maxValueNotIncluded){
// 	return Math.floor(Math.random()*(maxValueNotIncluded));
// }

function random(arg1, arg2) {
	var min, max;
	if (arg2) {
		min = arg1;
		max = arg2;
	} else {
		min = 0;
		max = arg1 | 1;
	}
	return Math.floor(Math.random() * (max - min) + min);
}

function randomItem(array) {
	var length = array.length;
	var randomIndex = random(length - 1);
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
