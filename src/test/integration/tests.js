#!/usr/bin/env node
'use strict';

const { Core } = require('./../../api');

const log = new (require('../../api/Logger'))(__filename),
  Flux = require('../../api/Flux'),
  Utils = require('../../api/Utils');

const testSequences = ['interfaceTest', 'serviceTest'];

module.exports.launch = launchTests;

function launchTests() {
  log.info('-----------------------------');
  log.INFO('>> Launching Test Sequence...');
  log.info('-----------------------------');
  let promiseList = [];
  testSequences.forEach(testSequence => {
    promiseList.push(require('./' + testSequence + '.js').runTest());
  });
  Promise.all(promiseList)
    .then(data => {
      allTestSuceedFeedback(data);
    })
    .catch(err => {
      log.error('Error(s) in test sequences:', err);
      log.info('Core.errors:' + Core.errors.length);
    });
}

function allTestSuceedFeedback(data) {
  log.info(data);
  log.info('-------------------------');
  log.INFO('>> All tests succeeded !!');
  log.info('-------------------------');
  let testTTS = Utils.rdm() ? 'Je suis Ok !' : { lg: 'en', msg: 'all tests succeeded!' };
  Flux.do('interface|tts|speak', testTTS);
  Flux.do('service|context|updateRestart', { mode: 'ready' }, { delay: 4 });
}
