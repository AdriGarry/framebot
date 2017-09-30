#!/usr/bin/env node
'use strict'

// log.debug(process.argv);
console.log('\r\nNew Odi starting...');
global.ODI_PATH = __filename.match(/\/.*\//g)[0]; // DEPRECATED ??

var Odi = require(ODI_PATH + 'core/Odi.js').init(__filename.match(/\/.*\//g)[0]);
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

// log.info('Odi.config', Odi.config);

// Brain
var brain = require(Odi.CORE_PATH + 'brain.js');

// Services
var soundService = require(Odi.CORE_PATH + 'services/soundService.js');
var timeService = require(Odi.CORE_PATH + 'services/timeService.js');

// Modules
// led.js, sound.js
// log.debug(process.argv);

/////////////  TEST  /////////////

// var log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]);

// var Log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]),
// log = new Log('toto');

setTimeout(function(){
  log.debug('PROCESS.EXIT');
  process.exit();
}, 30000);

// console.trace(); // to get line number
