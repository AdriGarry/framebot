#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
var log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

const sequences = ['interfaceTest', 'serviceTest'];
var testResult = {};

module.exports.launch = launchTests;
var testCallback = null;

function launchTests(callback) {
	testCallback = callback;
	log.info('-----------------------------');
	log.INFO('>> Launching Test Sequence...');
	log.info('-----------------------------');
	for (var i = 0; i < sequences.length; i++) {
		testResult[sequences[i]] = require(Core._SRC + 'test/' + sequences[i] + '.js').runTest(completeTest);
	}
}

var completeTest = (testId, result) => {
	Core.do('interface|led|blink', { leds: ['belly'], speed: 50, loop: 10 });
	log.info(testId, 'completed.');
	testResult[testId] = result;
	log.info();
	log.info(testId, 'completed!');
	log.info('-------------------------');
	log.debug(testResult);
	if (allTestCompleted()) {
		for (let test in testResult) {
			log.info(test, 'completed');
		}
		if (Core.errors.length > 0) log.info('Core.errors:' + Core.errors.length);

		log.info();
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
		if (!(testResult.hasOwnProperty(sequences[i]) || testResult[sequences[i]])) {
			return false;
		}
	}
	return true;
};

// Core.error('this is an error');
