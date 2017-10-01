#!/usr/bin/env node
'use strict'

const argv = process.argv;
const forcedDebug = argv[2] == 'debug' ? true : false;
console.log('\r\nNew Odi starting...', forcedDebug?'DEBUG (forced)':null);
// if(forcedDebug) console.log();

global.ODI_PATH = __filename.match(/\/.*\//g)[0];

var Odi = require(ODI_PATH + 'core/Odi.js').init(__filename.match(/\/.*\//g)[0]);
// console.log('Odi.conf', Odi.conf); // Voir pk ça ne marche pas...
console.log('Odi.conf.debug', Odi.conf.debug); // Voir pk ça ne marche pas...
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename, forcedDebug || Odi.conf.debug);// Odi.conf.debug || forcedDebug
log.debug('argv', argv);
/*var test = 0;
console.log('testA:',test);
test = test || 'changed';
console.log('testB:',test);*/

// Utils.js à part pour tout ce qui peut servir de partout...
// var util = require(Odi.CORE_PATH + 'services/util.js');

// Flux
var Flux = require(Odi.CORE_PATH + 'Flux.js');

// Services
var mood = require(Odi.CORE_PATH + 'services/mood.js');
var music = require(Odi.CORE_PATH + 'services/music.js');
var system = require(Odi.CORE_PATH + 'services/system.js');
var time = require(Odi.CORE_PATH + 'services/time.js');
var tools = require(Odi.CORE_PATH + 'services/tools.js');
var tts = require(Odi.CORE_PATH + 'services/tts.js');
var video = require(Odi.CORE_PATH + 'services/video.js');

// Modules
var hardware = require(Odi.CORE_PATH + 'modules/hardware.js');
var led = require(Odi.CORE_PATH + 'modules/led.js');
var sound = require(Odi.CORE_PATH + 'modules/sound.js');

/////////////  TEST  /////////////
// Flux.next(id, value, subject [,delay, ?])
//Flux.next('id', {value1: 'AA', value2: 'BB'}, 'subject');

// var Log = require(Odi.CORE_PATH + 'logger.js').init(__filename.match(/(\w*).js/g)[0]),
// log = new Log('toto');

log.info('I\'m Ready !!');

setTimeout(function(){
  log.debug('PROCESS.EXIT');
  process.exit();
}, 25000);

// console.trace(); // to get line number
