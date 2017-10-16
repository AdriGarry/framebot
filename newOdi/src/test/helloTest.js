#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Hello test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

module.exports.waitFor = function(callback) {
	setTimeout(() => {
		// log.info('helloTest CALLBACK(TRUE)');
		callback('helloTest', true);
	}, 2000);
};
