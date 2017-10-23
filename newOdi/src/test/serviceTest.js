#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Flux test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

module.exports.run = function(callback) {
	Flux.next('service', 'system', 'cpu', null, 4);

	setTimeout(() => {
		// Flux.next('service', 'max', 'doSomething', null, 2);
	}, 2000);

	setTimeout(() => {
		// log.info('fluxTest CALLBACK(TRUE)');
		callback('serviceTest', true);
	}, 10000);
};
