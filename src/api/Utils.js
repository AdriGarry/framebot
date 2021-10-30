#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');

const logger = require('./Logger');

const log = new logger(__filename);

const DATE_TIMEDEFAULT_PATTERN = 'D/M h:m:s';
const MILLISEC_IN_DAY = 86400000;
module.exports = class Utils {

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
		// TODO move to Logger
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

	/** Function to return true if one of string of stringArray is found in string param */
	static searchStringInArray(string, stringArray) {
		for (let i = 0; i < stringArray.length; i++) {
			if (stringArray[i].toLowerCase().indexOf(string.toLowerCase()) > -1) {
				return stringArray[i];
			}
		}
		return false;
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

	static firstLetterUpper(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/** Function to calculate execution time of something */
	static executionTime(startTime, formatResultPattern) {
		let elapsedTime = new Date() - startTime;
		// if (formatResultPattern) {
		// 	return addPatternBefore(elapsedTime, formatResultPattern);
		// }
		return elapsedTime;
	}

	// static addPatternBefore(time, pattern) {
	// 	if (typeof pattern == 'string') {
	// 		return pattern.charAt(0).repeat(pattern.length - time.toString().length) + time;
	// 	}
	// 	return time;
	// }

	static formatDuration(duration) {
		duration = parseInt(duration);
		if (duration > 120) {
			return Math.round(duration / 60) + 'm' + (duration % 60) + 's';
		}
		return duration + 's';
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
		const D = date.getDate();
		const M = date.getMonth() + 1;
		const Y = date.getFullYear();
		const h = date.getHours();
		const m = date.getMinutes();
		const s = date.getSeconds();
		const x = date.getMilliseconds();
		let now = '';

		if (typeof param === 'undefined') param = DATE_TIMEDEFAULT_PATTERN;
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

	static getWeek(givenDate) {
		let date = givenDate instanceof Date ? new Date(givenDate) : new Date();
		let onejan = new Date(date.getFullYear(), 0, 1);
		return Math.ceil((((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - onejan) / MILLISEC_IN_DAY) + onejan.getDay() + 1) / 7);
	}
};

/** Function to repeat/concat a string */
String.prototype.repeat = function (num) {
	if (Number(num) && num > 0) return new Array(Math.abs(num) + 1).join(this);
	return '';
};

/** Function to remove quotes in a string */
String.prototype.unQuote = function () {
	return this.replace(/'|"/gm, '');
};


