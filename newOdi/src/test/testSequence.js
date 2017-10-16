#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.INFO('-----------------------------');
log.INFO('>> LAUNCHING TEST SEQUENCE...');
log.INFO('-----------------------------');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

var sequence = {
	fluxTest: require(SRC_PATH + 'test/fluxTest.js').test(),
};

module.exports.start = function () {
	log.info('Semaphore to implement...');
};

setInterval(function () {
	console.log('Odi.errorHistory', Odi.errorHistory);
	log.INFO('---------------------------------------');
	if (Odi.errorHistory.length == 0) {
		log.INFO('STILL NO ERROR (test mode)');
	} else {
		log.INFO('Odi.errorHistory:\n', Odi.errorHistory);
	}
	log.INFO('---------------------------------------');
}, 10000);

// Odi.error('this is an error');

// semaphore here...