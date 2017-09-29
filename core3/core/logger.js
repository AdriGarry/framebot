#!/usr/bin/env node
'use strict'

module.exports = Logger;

var self = this;
var filename;
var dateTimeDefaultPattern = 'D/M h:m:s';

function Logger(filename, dateTimePattern){
    self.dateTimePattern = dateTimePattern || dateTimeDefaultPattern;
    self.filename = filename;
    info('Logger init:', self.filename);
    return {
        info: info,
        debug: debug,
        error: error
    }
};

/** Function to return date time. Pattern: 'YDT' */
function logTime(param, date){
	if(typeof date === 'undefined') date = new Date();
	var D = date.getDate();
	var M = date.getMonth()+1;
	var Y = date.getFullYear();
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var now = '';

    if(typeof param === 'undefined') param = self.dateTimePattern;
	for(var i = 0; i < param.length; i++){
		switch(param[i]){
			case 'Y':
				now += Y;
				break;
			case 'M':
				now += (M<10 ? '0' : '') + M;
				break;
			case 'D':
				now += (D<10 ? '0' : '') + D;
				break;
			case 'h':
				now += (h<10 ? '0' : '') + h;
				break;
			case 'm':
				now += (m<10 ? '0' : '') + m;
				break;
			case 's':
				now += (s<10 ? '0' : '') + s;
				break;
			default:
				now += param[i];
		}
	}
	// console.log('utils.now(param)', param, now);
	return now;
};

function info(args){
    console.log(logTime(), self.filename, args);
};

function debug(args){
    console.log(logTime(), self.filename, '\u2022', args);
};

function error(args){
    console.error(logTime(), self.filename, '>> ERR_', args);
};
