#!/usr/bin/env node
'use strict'

module.exports = Logger;

// var self = this;
// self.filename;
const dateTimeDefaultPattern = 'D/M h:m:s';

var dateTimePattern = '*dateTimePattern*';
var filename = '*filename*';

var i = 0;

function Logger(filename, dateTimePattern){
    // this.dateTimePattern = dateTimePattern || dateTimeDefaultPattern;
	// this.filename = filename;
    dateTimePattern = dateTimePattern || dateTimeDefaultPattern;
	filename = filename;
	i++;
	info('Logger init:', i, filename);

	this.info = info;
	this.debug = debug;
	this.error = error;
	this.logTime = logTime;
	return this;
    // return {
    //     info: info,
    //     debug: debug,
    //     error: error
	// }
	
	function info(){
		console.log(logTime(), '['+filename+']', arguments);
	};
	
	function debug(){
		console.log(logTime(), '\u2022', '['+filename+']', arguments);
	};
	
	function error(){
		console.error(logTime(), '['+filename+']', '>> ERR_', arguments);
	};
	
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

    if(typeof param === 'undefined') param = dateTimePattern;
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
