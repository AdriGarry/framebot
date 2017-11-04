#!/usr/bin/env node
'use strict';

const startTime = new Date();
console.log('.');
var Gpio = require('onoff').Gpio;
var eye = new Gpio(14, 'out').write(1);

const argv = process.argv;
const forcedDebug = argv.indexOf('debug') > 0 ? true : false;
const test = argv.indexOf('test') > 0 ? true : false;

// if (test) console.log('>> TEST MODE !!');
global.ODI_PATH = __dirname.match(/\/.*\//g)[0];
global.SRC_PATH = __dirname + '/';

var Odi = require(ODI_PATH + 'src/core/Odi.js').init(__filename.match(/\/.*\//g)[0], forcedDebug, test);

var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename, Odi.conf.debug); // Odi.conf.debug || forcedDebug
log.debug('argv', argv);

var Utils = require(Odi.CORE_PATH + 'Utils.js');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

var Brain = require(Odi.CORE_PATH + 'Brain.js');

/*var modules = {
	led: require(Odi.CORE_PATH + 'modules/led.js'),
	hardware: require(Odi.CORE_PATH + 'modules/hardware.js'),
	sound: Odi.conf.mode == 'sleep' ? null : require(Odi.CORE_PATH + 'modules/sound.js'),
	tts: Odi.conf.mode == 'sleep' ? null : require(Odi.CORE_PATH + 'modules/tts.js')
};
log.info('Modules loaded:', Object.keys(modules).join(', '));
var controllers = {
	button: require(Odi.CORE_PATH + 'controllers/button.js'),
	jobs: require(Odi.CORE_PATH + 'controllers/jobs.js')
	// server: require(Odi.CORE_PATH + "controllers/server.js")
};
log.info('Controllers loaded:', Object.keys(controllers).join(', '));
var services = {
	max: require(Odi.CORE_PATH + 'services/max.js'), // Max & Co...
	mood: require(Odi.CORE_PATH + 'services/mood.js'), // random, exclamation, badBoy, party, [cigales ?]
	music: require(Odi.CORE_PATH + 'services/music.js'), // fip, jukebox
	system: require(Odi.CORE_PATH + 'services/system.js'),
	time: require(Odi.CORE_PATH + 'services/time.js'),
	tools: require(Odi.CORE_PATH + 'services/tools.js'), // ??
	video: require(Odi.CORE_PATH + 'services/video.js'),
	voiceMail: require(Odi.CORE_PATH + 'services/voicemail.js')
};
log.info('Services loaded:', Object.keys(services).join(', '));*/

const modules = ['modules', 'led','hardware', 'sound', 'tts'];
const controllers = ['controllers','button', 'jobs'/*, 'server' */];
const services = ['services', 'system', 'time', 'tools', 'music', 'mood', 'voicemail', 'max', 'video'];

launchObservers(modules);
launchObservers(controllers);
launchObservers(services);
function launchObservers(oberservers){
	let type = oberservers.shift();
	for(let i = 0;i<oberservers.length;i++){
		require(Odi.CORE_PATH + type + '/' + oberservers[i] + '.js')
		// log.info(oberservers[i], 'observer loaded');
	}
	log.info(type, 'loaded:', oberservers.join(', '));
}


log.info('Odi ready in' + Utils.getExecutionTime(startTime, '     ') + 'ms');

/////////////  TEST section  /////////////
if (test || Odi.conf.mode == 'test') {
	setTimeout(function() {
		var testSequence = require(SRC_PATH + 'test/tests.js').launch(function(testStatus) {
			// retour console + tts, and restart if test success
			setTimeout(function() {
				if (testStatus) Odi.update({ mode: 'ready' }, true);
			}, 2000);
		});
	}, 500);
}

if(Odi.conf.mode == 'sleep') {
	// console.log('1111');
	Flux.next('service', 'system', 'restart', null, 10);
}else{
	// console.log('2222');
	Flux.next('service', 'system', 'restart', 'sleep', 10);
}


/*setTimeout(function() {
	log.DEBUG('process.exit');
	process.exit();
}, 30000);*/

// var start = new Date();
// setTimeout(function(argument) {
// 	// execution time simulated with setTimeout function
// 	var end = new Date() - start;
// 	console.info('Execution time: %dms', end);
// }, 5000);
