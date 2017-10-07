#!/usr/bin/env node
'use strict';

console.log('.');
const argv = process.argv;
const forcedDebug = argv[2] == 'debug' ? true : false;
const test = argv[3] == 'test' ? true : false;
global.ODI_PATH = __filename.match(/\/.*\//g)[0];

var fs = require('fs');
const logo = fs.readFileSync(ODI_PATH + 'data/odiLogo.properties', 'utf8').toString().split('\n');
console.log('\n' + logo.join('\n'));

var Odi = require(ODI_PATH + 'core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedDebug); // console.log('Odi.conf.debug', Odi.conf.debug);
// if (Odi.conf.debug || forcedDebug) console.log('DEBUG mode');
// if (forcedDebug) Odi.conf.debug = 'forced'; // Créer méthode pour persister en json
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename, /*forcedDebug ||*/ Odi.conf.debug); // Odi.conf.debug || forcedDebug
log.debug('argv', argv);
// log.INFO('hey salut toi !');

// Init OK
// Utils.js à part, pour tout ce qui peut servir de partout...
var Utils = require(Odi.CORE_PATH + 'Utils.js');
// console.log(Utils);

// Flux
var Flux = require(Odi.CORE_PATH + 'Flux.js');

// Controllers
var controllers = {
	button: require(Odi.CORE_PATH + "controllers/button.js"),
	jobs: require(Odi.CORE_PATH + "controllers/jobs.js")
};
log.info('Controllers loaded', Object.keys(controllers));

// Modules
var modules = {
	hardware: require(Odi.CORE_PATH + 'modules/hardware.js'),
	led: require(Odi.CORE_PATH + 'modules/led.js'),
	sound: require(Odi.CORE_PATH + 'modules/sound.js')
};
log.info('Modules loaded', Object.keys(modules));

// Services
var services = {
	mood: require(Odi.CORE_PATH + 'services/mood.js'),
	music: require(Odi.CORE_PATH + 'services/music.js'),
	system: require(Odi.CORE_PATH + 'services/system.js'),
	time: require(Odi.CORE_PATH + 'services/time.js'),
	tools: require(Odi.CORE_PATH + 'services/tools.js'),
	tts: require(Odi.CORE_PATH + 'services/tts.js'),
	video: require(Odi.CORE_PATH + 'services/video.js')
};
log.info('Services loaded', Object.keys(services));


/////////////  TEST section  /////////////
// Flux.next(id, value, subject [,delay, ?])
//Flux.next('id', {value1: 'AA', value2: 'BB'}, 'subject');

// log.info('I\'m Ready !!');

setTimeout(function () {
	log.debug('PROCESS.EXIT');
	process.exit();
}, 25000);

// console.trace(); // to get line number
