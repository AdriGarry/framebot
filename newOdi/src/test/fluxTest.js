#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('Flux test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

module.exports.run = function(callback) {
	Flux.next('module', 'sound', 'mute', 'MUTE');

	Flux.next('module', 'sound', 'mute', 'MUTE', 8);

	setTimeout(() => {
		Flux.next('module', 'led', 'blink', 'eye...', 2, 3);
	}, 1000);

	setTimeout(() => {
		log.info('Testing invalid flux:');
		Flux.next('module', 'toto', null);
	}, 10000);

	setTimeout(() => {
		callback('fluxTest', true);
	}, 15000);
};
