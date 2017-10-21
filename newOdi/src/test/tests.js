#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

const sequences = ['fluxTest', 'helloTest']; // flux.test.js, hello.test.js ?
var testResult = {};

/*module.exports.launch = function(callback) {
	launchTests(function() {
		if (allTestCompleted()) {
			callback('=====================>\n=======>All tests succeeded !!\n=====================>');
		}
	});
};*/

module.exports.launch = launchTests;
var testCallback = null;

function launchTests(callback) {
	testCallback = callback;
	log.INFO('-----------------------------');
	log.INFO('>> LAUNCHING TEST SEQUENCE...');
	log.INFO('-----------------------------');
	for (var i = 0; i < sequences.length; i++) {
		testResult[sequences[i]] = require(SRC_PATH + 'test/' + sequences[i] + '.js').run(completeTest);
	}
	log.info('Launched tests:', Object.keys(testResult));
}

var completeTest = (testId, result) => {
	log.info(testId, 'completed!', result);
	testResult[testId] = result;
	log.debug(testResult);
	if (allTestCompleted()) {
		log.INFO('-------------------------');
		log.info('>> All tests succeeded !!');
		log.INFO('-------------------------');
		testCallback(testResult);
	}
};

var allTestCompleted = () => {
	// log.info('..testResult==>', testResult, sequences);
	for (var i = 0; i < sequences.length; i++) {
		// log.info('+++ ', sequences[i], testResult[sequences[i]]);
		// log.info(testResult.hasOwnProperty('sequences[i]'), testResult[sequences[i]]);
		if (!(testResult.hasOwnProperty('sequences[i]') || testResult[sequences[i]])) {
			return false;
		}
	}
	return true;
};

setInterval(() => {
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
