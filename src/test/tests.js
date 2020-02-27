#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(Core._API + 'Utils.js');

const testSequences = ['interfaceTest', 'serviceTest'];

module.exports.launch = launchTests;

function launchTests() {
	log.info('-----------------------------');
	log.INFO('>> Launching Test Sequence...');
	log.info('-----------------------------');
	let promiseList = [];
	testSequences.forEach(testSequence => {
		promiseList.push(require(Core._SRC + 'test/' + testSequence + '.js').runTest());
	});
	Promise.all(promiseList)
		.then(data => {
			allTestSuceedFeedback(data);
		})
		.catch(err => {
			log.error('Error(s) in test sequences:', err);
			log.info('Core.errors:' + Core.errors.length);
			// Core.do('service|context|updateRestart', { mode: 'ready' }, { delay: 4 });
		});
}

function allTestSuceedFeedback(data) {
	log.info(data);
	log.info('-------------------------');
	log.INFO('>> All tests succeeded !!');
	log.info('-------------------------');
	Core.do('service|sms|send', 'ALL TEST SUCCEED !!');
	let testTTS = Utils.rdm() ? 'Je suis Ok !' : { lg: 'en', msg: 'all tests succeeded!' };
	Core.do('interface|tts|speak', testTTS);
	Core.do('service|context|updateRestart', { mode: 'ready' }, { delay: 4 });
}
