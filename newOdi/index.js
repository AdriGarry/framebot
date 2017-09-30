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
var mood = require(Odi.CORE_PATH + 'services/mood.js');
var music = require(Odi.CORE_PATH + 'services/music.js');
var system = require(Odi.CORE_PATH + 'services/system.js');
var time = require(Odi.CORE_PATH + 'services/time.js');
var tools = require(Odi.CORE_PATH + 'services/tools.js');
var tts = require(Odi.CORE_PATH + 'services/tts.js');
var util = require(Odi.CORE_PATH + 'services/util.js');
var video = require(Odi.CORE_PATH + 'services/video.js');

// Modules
var hardware = require(Odi.CORE_PATH + 'modules/hardware.js');
var led = require(Odi.CORE_PATH + 'modules/led.js');
var sound = require(Odi.CORE_PATH + 'modules/sound.js');

/////////////  TEST  /////////////

// var log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]);

// var Log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]),
// log = new Log('toto');

setTimeout(function(){
  log.debug('PROCESS.EXIT');
  process.exit();
}, 25000);

// console.trace(); // to get line number
