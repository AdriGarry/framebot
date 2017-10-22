#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

const sequences = ['fluxTest', 'moduleTest', 'serviceTest'];
var testResult = {};

module.exports.launch = launchTests;
var testCallback = null;

function launchTests(callback) {
	testCallback = callback;
	log.info('-----------------------------');
	log.INFO('>> Launching Test Sequence...');
	log.info('-----------------------------');
	for (var i = 0; i < sequences.length; i++) {
		testResult[sequences[i]] = require(SRC_PATH + 'test/' + sequences[i] + '.js').run(completeTest);
	}
}

var completeTest = (testId, result) => {
	log.info(testId, 'completed!', result);
	testResult[testId] = result;
	log.debug(testResult);
	if (allTestCompleted()) {
		log.info('-------------------------');
		log.INFO('>> All tests succeeded !!');
		log.info('-------------------------');
		testCallback(true); //testResult
	}
};

var allTestCompleted = () => {
	for (var i = 0; i < sequences.length; i++) {
		if (!(testResult.hasOwnProperty('sequences[i]') || testResult[sequences[i]])) {
			return false;
		}
	}
	if (Odi.errorHistory.length > 0) {
		log.info('-----------------');
		log.info('Odi.errorHistory:\n', Odi.errorHistory, '\n\n');
		// log.info('---------------------------------------');
	}
	return true;
};

// Odi.error('this is an error');
