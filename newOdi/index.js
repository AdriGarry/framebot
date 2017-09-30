#!/usr/bin/env node
'use strict'

// console.log(process.argv);
console.log('\r\nNew Odi starting...');
global.ODI_PATH = __filename.match(/\/.*\//g)[0];

var Odi = require(ODI_PATH + 'core/Odi.js').init(__filename.match(/\/.*\//g)[0]);
// console.log('Odi.conf.debug', Odi.conf.debug); // Voir pk ça ne marche pas...
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename, true);//Odi.conf.debug

// log.debug('Odi.conf', Odi.conf);

// Brain
var brain = require(Odi.CORE_PATH + 'brain.js');

// Services
var soundService = require(Odi.CORE_PATH + 'modules/sound.js');
var timeService = require(Odi.CORE_PATH + 'services/time.js');

// Modules
// var soundModule = require(Odi.CORE_PATH + 'modules/sound.js');
var ledModule = require(Odi.CORE_PATH + 'modules/led.js');

/////////////  TEST  /////////////

// var log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]);

// var Log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]),
// log = new Log('toto');

setTimeout(function(){
  log.debug('PROCESS.EXIT');
  process.exit();
}, 25000);

// console.trace(); // to get line number
