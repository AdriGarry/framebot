#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
	os = require('os');

const logger = require('./Logger');

const log = new logger(__filename);

const DATE_TIMEDEFAULT_PATTERN = 'D/M h:m:s';
const MILLISEC_IN_DAY = 86400000;
module.exports = class Utils {

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

	static firstLetterUpper(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
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

	/** Function to calculate execution time of something */
	static executionTime(startTime, formatResultPattern) {
		let elapsedTime = new Date() - startTime;
		// if (formatResultPattern) {
		// 	return addPatternBefore(elapsedTime, formatResultPattern);
		// }
		return elapsedTime;
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


