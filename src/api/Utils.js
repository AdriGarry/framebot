#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
	fs = require('fs'),
	fsPromises = fs.promises,
	os = require('os'),
	request = require('request'),
	dns = require('dns');

const logger = require('./Logger');

const log = new logger(__filename);

module.exports = class Utils {
	/**
	 * Function to retreive code position (file & line) at runtime
	 * @param {*} steps
	 */
	static codePosition(steps) {
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
	static repeatString(string, times) {
		return Array(times + 1).join(string);
	}

	static formatStringLength(string, expectedLength, before) {
		let stringLength = string.length,
			stringFormated;
		if (stringLength >= expectedLength) {
			stringFormated = string.substring(0, expectedLength);
		} else {
			if (before) {
				stringFormated = Utils.repeatString(' ', expectedLength - stringLength) + string;
			} else {
				stringFormated = string + Utils.repeatString(' ', expectedLength - stringLength);
			}
		}
		return stringFormated;
	}

	static deleteFolderRecursive(path) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file, index) {
				let curPath = path + '/' + file;
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

	/** Function to append an array in JSON file */
	static appendJsonFile(filePath, obj) {
		let startTime = new Date();
		fsPromises
			.readFile(filePath)
			.catch(_fileNotExists)
			.then(data => _appendFileData(data, obj))
			.then(data => fsPromises.writeFile(filePath, data))
			.then(() => log.debug('file ' + filePath + ' updated in', Utils.executionTime(startTime) + 'ms'))
			.catch(err => log.error('Utils.appendArrayInJsonFile', err));
	}

	/** Get name of files in directory. Return a Promise  */
	static directoryContent(path) {
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

	/** Function getJsonFileContent. Return a Promise */
	static getJsonFileContent(filePath) {
		log.debug('getJsonFileContent() ', filePath);
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, (err, data) => {
				if (err && err.code === 'ENOENT' && !Utils.searchStringInArray(filePath, FILE_NOT_FOUND_EXCEPT)) {
					log.error('No file: ' + filePath);
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	/** Function to return true if one of string of stringArray is found in string param */
	static searchStringInArray(string, stringArray) {
		for (let i = 0; i < stringArray.length; i++) {
			if (stringArray[i].toLowerCase().indexOf(string.toLowerCase()) > -1) {
				return stringArray[i];
			}
		}
		return false;
	}

	static arrayToObject(array, property) {
		return array.reduce((obj, item) => {
			obj[item[property]] = item;
			return obj;
		}, {});
	}

	static getLocalIp() {
		let ifaces = os.networkInterfaces(),
			localIp = '';
		Object.keys(ifaces).forEach(function (ifname) {
			let alias = 0;
			ifaces[ifname].forEach(function (iface) {
				if ('IPv4' !== iface.family || iface.internal !== false) {
					// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
					return;
				}
				if (alias >= 1) {
					// this single interface has multiple ipv4 addresses
					// console.log(ifname + ':' + alias, iface.address);
					localIp += ifname + ':' + alias + ' ' + iface.address;
				} else {
					// this interface has only one ipv4 adress
					localIp = iface.address;
				}
				++alias;
			});
		});
		return localIp;
	}

	static getPublicIp() {
		return new Promise((resolve, reject) => {
			Utils.execCmd('curl icanhazip.com')
				.then(data => {
					resolve(data.trim());
				})
				.catch(err => {
					log.warn("Can't retreive public IP " + err);
					reject(err);
				});
		});
	}

	static postOdi(url, data) {
		return new Promise((resolve, reject) => {
			request.post(
				{
					url: url,
					headers: {
						'Content-Type': 'application/json',
						'User-Interface': 'UIv5'
					},
					json: true,
					data: data
				},
				(err, httpResponse, body) => {
					if (err) reject(err);
					resolve(body);
				}
			);
		});
	}

	/** Function to test internet connection */
	static testConnection() {
		return new Promise((resolve, reject) => {
			dns.lookup('google.com', function (err) {
				if (err && err.code == 'ENOTFOUND') {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	/** Function to execute a shell command. Return a Promise */
	static execCmd(command, noLog) {
		return new Promise((resolve, reject) => {
			exec(command, { shell: true }, (err, stdout, stderr) => {
				if (err && !noLog) {
					log.error('execCmd', err, stderr);
					reject(err);
				} else {
					resolve(stdout);
				}
			});
		});
	}

	static debounce(func, wait, immediate, context) {
		let result;
		let timeout = null;
		return function () {
			let ctx = context || this,
				args = arguments;
			let later = function () {
				timeout = null;
				if (!immediate) result = func.apply(ctx, args);
			};
			let callNow = immediate && !timeout;
			// Tant que la fonction est appelée, on reset le timeout.
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) result = func.apply(ctx, args);
			return result;
		};
	}

	static throttle(func, wait, leading, trailing, context) {
		let ctx, args, result;
		let timeout = null;
		let previous = 0;
		let later = function () {
			previous = new Date();
			timeout = null;
			result = func.apply(ctx, args);
		};
		return function () {
			let now = new Date();
			if (!previous && !leading) previous = now;
			let remaining = wait - (now - previous);
			ctx = context || this;
			args = arguments;
			// Si la période d'attente est écoulée
			if (remaining <= 0) {
				// Réinitialiser les compteurs
				clearTimeout(timeout);
				timeout = null;
				// Enregistrer le moment du dernier appel
				previous = now;
				// Appeler la fonction
				result = func.apply(ctx, args);
			} else if (!timeout && trailing) {
				// Sinon on s’endort pendant le temps restant
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	}

	static getAbsolutePath(path, prefix) {
		if (typeof path !== 'string') {
			log.error('Path must be a string: ' + typeof path, path);
			return false;
		}
		if (path.indexOf('/home') === -1) {
			path = prefix + path;
		}
		if (!fs.existsSync(path)) {
			log.error('Wrong file path', path);
			return false;
		}
		return path;
	}

	/** Function to retreive audio or video file duration. Return a Promise */
	static getDuration(soundFile, callback) {
		log.debug('getDuration:', soundFile);
		return new Promise((resolve, reject) => {
			Utils.execCmd('mplayer -ao null -identify -frames 0 ' + soundFile + ' 2>&1 | grep ID_LENGTH')
				.then(data => {
					try {
						if (data == '') {
							getDuration(soundFile, callback);
						}
						let duration = data.split('=')[1].trim();
						resolve(parseInt(duration));
					} catch (err) {
						// Don't log error because the method will call itself until OK !
						// console.error('getDuration error:', err);
						reject(err);
					}
				})
				.catch(err => {
					log.error('getDuration error', err);
					reject(err);
				});
		});
	}

	static firstLetterUpper(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/** Function to calculate execution time of something */
	static executionTime(startTime, formatResultPattern) {
		let elapsedTime = new Date() - startTime;
		if (formatResultPattern) {
			return addPatternBefore(elapsedTime, formatResultPattern);
		}
		return elapsedTime;
	}

	static addPatternBefore(time, pattern) {
		if (typeof pattern == 'string') {
			return pattern.charAt(0).repeat(pattern.length - time.toString().length) + time;
		}
		return time;
	}

	static formatDuration(duration) {
		duration = parseInt(duration);
		if (duration > 120) {
			return Math.round(duration / 60) + 'm' + (duration % 60) + 's';
		}
		return duration + 's';
	}

	static numberWithDot(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}

	static perCent(value, total, precision) {
		return ((value / total) * 100).toFixed(precision | 2);
	}

	static rdm(arg1, arg2) {
		return Utils.random(arg1, arg2);
	}

	static random(arg1, arg2) {
		let min, max;
		if (arg2) {
			min = arg1;
			max = arg2;
		} else {
			min = 0;
			max = arg1 || 2;
		}
		return Math.floor(Math.random() * (max - min) + min);
	}

	static randomItem(array) {
		let length = array.length;
		let randomIndex = Utils.random(length); // length - 1
		return array[randomIndex];
	}

	static delay(sec) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, sec * 1000);
		});
	}

	static delayMs(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	/** Function to return date time. Pattern: 'YDT' */
	static logTime(param, date) {
		if (typeof date === 'undefined') date = new Date();
		let D = date.getDate();
		let M = date.getMonth() + 1;
		let Y = date.getFullYear();
		let h = date.getHours();
		let m = date.getMinutes();
		let s = date.getSeconds();
		let x = date.getMilliseconds();
		let now = '';

		if (typeof param === 'undefined') param = dateTimeDefaultPattern;
		for (let i = 0; i < param.length; i++) {
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

	static capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/**  Function to return next object with date from array of objects with date property **/
	static getNextDateObject(datesObjectArray) {
		let nextDateObject;
		datesObjectArray.forEach(obj => {
			if (!nextDateObject || (nextDateObject && nextDateObject.date > obj.date)) nextDateObject = obj;
		});
		return nextDateObject;
	}

	static isWeekend(date) {
		if (!date) date = new Date();
		let day = date.getDay();
		return day === 6 || day === 0;
	}
};

const FILE_NOT_FOUND_EXCEPT = ['/home/odi/framebot/tmp/voicemail.json', '/home/odi/framebot/tmp/record.json'],
	dateTimeDefaultPattern = 'D/M h:m:s';

function _fileNotExists(err) {
	return new Promise((resolve, reject) => {
		if (err.code == 'ENOENT') resolve('[]');
		else reject(err);
	});
}

function _appendFileData(data, obj) {
	return new Promise((resolve, reject) => {
		try {
			let fileData;
			try {
				fileData = JSON.parse(data);
			} catch (err) {
				log.info(data);
				log.error('appendFileData: error while JSON.parse(data)', err);
			}
			if (!Array.isArray(fileData)) fileData = [fileData];

			fileData.push(obj);

			let jsonData = JSON.stringify(fileData, null, 2)
				.replace(/\\/g, '')
				.replace(/\"{/g, '{')
				.replace(/\}"/g, '}');

			resolve(jsonData);
		} catch (err) {
			reject(err);
		}
	});
}

/** Function to repeat/concat a string */
String.prototype.repeat = function (num) {
	if (Number(num) && num > 0) return new Array(Math.abs(num) + 1).join(this);
	return '';
};

/** Function to remove quotes in a string */
String.prototype.unQuote = function () {
	return this.replace(/'|"/gm, '');
};

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
	let date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
	// January 4 is always in week 1.
	let week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};
