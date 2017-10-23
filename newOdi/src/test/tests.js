#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

const sequences = ['moduleTest', 'serviceTest'];
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
	Flux.next('module', 'led', 'blink', { leds: ['eye', 'belly', 'satellite'], speed: 100, loop: 5 });
	log.info(testId, 'completed.' /*, result*/);
	testResult[testId] = result;
	log.debug(testResult);
	if (allTestCompleted()) {
		// log.info();
		log.info(Odi.errors.length > 0 ? 'Odi.errors:' + Odi.errors.length : '');
		log.info('-------------------------');
		log.INFO('>> All tests succeeded !!');
		log.info('-------------------------');
		setTimeout(function() {
			testCallback(true); //testResult
		}, 1000);
	}
};

var allTestCompleted = () => {
	for (var i = 0; i < sequences.length; i++) {
		if (!(testResult.hasOwnProperty('sequences[i]') || testResult[sequences[i]])) {
			return false;
		}
	}
	return true;
};

// Odi.error('this is an error');
