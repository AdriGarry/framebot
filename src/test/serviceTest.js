#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Flux test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi._CORE + 'Flux.js');

module.exports.run = function(callback) {
	// Flux.next('service', 'system', 'cpu', null, 4);

	Flux.next('service', 'voicemail', 'new', {msg: 'are you there ?'}, 3);
	Flux.next('service', 'voicemail', 'check', null, 5);
	Flux.next('service', 'voicemail', 'clear', null, 10);

	setTimeout(() => {
		callback('serviceTest', true);
	}, 20000);
};
