#!/usr/bin/env node
'use strict';

const argv = process.argv;
const forcedDebug = argv.indexOf('debug') > 0 ? true : false;
const test = argv.indexOf('test') > 0 ? true : false;
// console.log('-------------');
// console.log(argv);
// console.log(argv.indexOf('debug'));
// console.log(argv.indexOf('test'));
// console.log('-------------');

if (test) console.log('>> TEST MODE !!');
global.ODI_PATH = __dirname.match(/\/.*\//g)[0];
global.SRC_PATH = __dirname + '/';

var fs = require('fs');
var logo = fs
	.readFileSync(ODI_PATH + 'data/odiLogo.properties', 'utf8')
	.toString()
	.split('\n');
console.log('\n' + logo.join('\n'));

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedDebug); // console.log('Odi.conf.debug', Odi.conf.debug);
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename, /*forcedDebug ||*/ Odi.conf.debug); // Odi.conf.debug || forcedDebug
log.debug('argv', argv);

var Utils = require(Odi.CORE_PATH + 'Utils.js');

// Flux
var Flux = require(Odi.CORE_PATH + 'Flux.js');

// Brain
var Brain = require(Odi.CORE_PATH + 'Brain.js');

// Controllers
var controllers = {
	button: require(Odi.CORE_PATH + 'controllers/button.js'),
	jobs: require(Odi.CORE_PATH + 'controllers/jobs.js')
	// server: require(Odi.CORE_PATH + "controllers/server.js")
};
log.info('Controllers loaded', Object.keys(controllers));

// Services
var services = {
	mood: require(Odi.CORE_PATH + 'services/mood.js'),
	music: require(Odi.CORE_PATH + 'services/music.js'),
	system: require(Odi.CORE_PATH + 'services/system.js'),
	time: require(Odi.CORE_PATH + 'services/time.js'),
	tools: require(Odi.CORE_PATH + 'services/tools.js'),
	video: require(Odi.CORE_PATH + 'services/video.js')
};
log.info('Services loaded', Object.keys(services));

// Modules
var modules = {
	hardware: require(Odi.CORE_PATH + 'modules/hardware.js'),
	led: require(Odi.CORE_PATH + 'modules/led.js'),
	sound: require(Odi.CORE_PATH + 'modules/sound.js'),
	tts: require(Odi.CORE_PATH + 'modules/tts.js')
};
log.info('Modules loaded', Object.keys(modules));

log.debug("I'm Ready !!");

/////////////  TEST section  /////////////

if (test) {
	var testSequence = require(SRC_PATH + 'test/tests.js').launch(function(testStatus) {
		// retour console + tts, and restart if test success
	});
}

setTimeout(function() {
	log.DEBUG('process.exit');
	process.exit();
}, 30000);
