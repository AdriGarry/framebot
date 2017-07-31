#!/usr/bin/env node

// Module Error
// http://www.hexacta.com/2015/11/03/node-js-the-error-object/

//var util = require('util');

module.exports = {
};


function OdiError(message){
	this.name = this.constructor.name;
	this.message = message;

	Error.captureStackTrace(this, this.constructor); //include stack trace in error object
}

OdiError.prototype = new Error();

// Examples

