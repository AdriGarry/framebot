#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(Core._CORE + 'Utils.js');

const testSequences = ['interfaceTest', 'serviceTest'];

var testResults = {};

module.exports.launch = launchTests;

function launchTests() {
	log.info('-----------------------------');
	log.INFO('>> Launching Test Sequence...');
	log.info('-----------------------------');
	let promiseList = [];
	for (var i = 0; i < testSequences.length; i++) {
		let testModule = require(Core._SRC + 'test/' + testSequences[i] + '.js').runTest();
		promiseList.push(testModule);
	}
	Promise.all(promiseList)
		.then(data => {
			Core.do('service|sms|send', 'ALL TEST SUCCEED !!');
			if (Core.errors.length > 0) log.info('Core.errors:' + Core.errors.length);
			log.info(data);
			log.info('-------------------------');
			log.INFO('>> All tests succeeded !!');
			log.info('-------------------------');
			setTimeout(function() {
				allTestSuceedFeedback(); //testResults
			}, 1000);
		})
		.catch(err => {
			log.error('Error in test sequence!');
			// Core.do('service|context|updateRestart', { mode: 'ready' }, { delay: 2 });
		});
}

// var completeTest = (testId, result) => {
// 	Core.do('interface|led|blink', { leds: ['belly'], speed: 50, loop: 10 });
// 	testResults[testId] = result;
// 	log.info();
// 	log.info(testId, 'completed.');
// 	log.debug(testResults);
// 	if (areAllTestCompleted()) {
// 		Core.do('service|sms|send', 'ALL TEST SUCCEED !!');
// 		for (let test in testResults) {
// 			log.info(test, 'completed');
// 		}
// 		if (Core.errors.length > 0) log.info('Core.errors:' + Core.errors.length);
// 		log.info();
// 		log.info('-------------------------');
// 		log.INFO('>> All tests succeeded !!');
// 		log.info('-------------------------');
// 		setTimeout(function() {
// 			allTestSuceedFeedback(true); //testResults
// 		}, 1000);
// 	}
// };

function areAllTestCompleted() {
	let anyTestNotCompleted = true;
	Object.keys(testResults).forEach(item => {
		if (!testResults[item]) {
			anyTestNotCompleted = false;
		}
	});
	return anyTestNotCompleted;
}

function allTestSuceedFeedback() {
	let testTTS = Utils.rdm()
		? 'Je suis Ok !'
		: {
				lg: 'en',
				msg: 'all tests succeeded!'
		  };
	Core.do('interface|tts|speak', testTTS);
	setTimeout(function() {
		Core.do('service|context|updateRestart', { mode: 'ready' });
	}, 4000);
}

// Core.error('this is an error');
