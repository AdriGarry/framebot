#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.INFO('-----------------------------');
log.INFO('>> LAUNCHING TEST SEQUENCE...');
log.INFO('-----------------------------');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

const sequences = ['fluxTest', 'helloTest'];
var testResult = {};

module.exports.launch = function(callback) {
	log.info('Semaphore to implement...');
	launchTests(function() {
		if (allTestCompleted()) {
			callback('=====================>\n=======>test successed !!\n=====================>');
		}
	});
};

var launchTests = () => {
	log.info('launching all tests', sequences);
	for (var i = 0; i < sequences.length; i++) {
		testResult[sequences[i]] = require(SRC_PATH + 'test/' + sequences[i] + '.js').waitFor(completeTest);
	}
	log.info('Launched tests:', Object.keys(testResult));
};

var completeTest = (testId, result) => {
	log.info('test', testId, 'completed!', result);
	testResult[testId] = result;
	log.info(testResult);
};

var allTestCompleted = () => {
	for (var i = 0; i < sequences.length; i++) {
		if (!(testResult.hasOwnProperty('sequences[i]') && testResult[sequences[i]])) {
			// c'est ici que ça bloque...
			log.INFO('returning false');
			return false;
		}
	}
	return true;
};

setInterval(function() {
	console.log('Odi.errorHistory', Odi.errorHistory);
	log.info('---------------------------------------');
	if (Odi.errorHistory.length == 0) {
		log.INFO('STILL NO ERROR (test mode)');
	} else {
		log.INFO('Odi.errorHistory:\n', Odi.errorHistory);
	}
	log.info('---------------------------------------');
}, 10000);

// Odi.error('this is an error');

// semaphore here...
