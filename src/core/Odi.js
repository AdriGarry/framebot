#!/usr/bin/env node
'use strict';

// var Object = new (require(ODI_PATH + 'src/core/Object.js'))();
var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
var Lock = require(ODI_PATH + 'src/core/Lock.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var fs = require('fs');

var _runtime = {
	etat: null,
	volume: null,
	max: null,
	mood: [],
	music: false,
	alarm: false,
	timer: 0,
	voicemail: null,
	cpu: {
		usage: null,
		temp: null
	},
	memory: {
		odi: null,
		system: null
	},
	stats: {
		diskSpace: null,
		totalLines: null,
		update: null
	}
};
var Odi = {
	conf: new Lock(require(ODI_PATH + 'conf.json'), ODI_PATH + 'conf.json'),
	isAwake: isAwake,
	run: new Lock(_runtime),
	error: error,
	errors: [],
	ttsMessages: require(ODI_PATH + 'data/ttsMessages.json'),
	_SRC: ODI_PATH + 'src/',
	_CORE: ODI_PATH + 'src/core/',
	_SHELL: ODI_PATH + 'src/shell/',
	_WEB: ODI_PATH + 'src/web/',
	_CONF: ODI_PATH + 'conf.json',
	_DATA: ODI_PATH + 'data/',
	_MP3: ODI_PATH + 'media/mp3/',
	_LOG: ODI_PATH + 'log/',
	_TMP: ODI_PATH + 'tmp/'
};
module.exports = {
	init: initOdi,
	Odi: Odi
};

var Flux = { next: null };
function initOdi(path, descriptor, forcedParams, startTime) {
	Odi.PATH = path;
	let packageJson = require(ODI_PATH + 'package.json');
	// console.log(packageJson.version);
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)'), version: packageJson.version },
		forcedParamsLog = '';
	if (forcedParams.sleep) {
		Odi.conf('mode', 'sleep');
		confUpdate.mode = 'sleep';
		forcedParamsLog += 'sleep ';
	}
	if (forcedParams.debug) {
		Odi.conf('debug', 'forced');
		forcedParamsLog += 'debug ';
	}
	const logo = fs
		.readFileSync(ODI_PATH + 'data/' + (!Odi.isAwake() ? 'odiLogoSleep' : 'odiLogo') + '.properties', 'utf8')
		.toString()
		.split('\n');
	console.log('\n' + logo.join('\n'));
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	log.table(Odi.conf(), 'CONFIG');
	log.info('initialization...', Odi.conf('debug') ? 'DEBUG' + (Odi.conf('debug') == 'forced' ? ' [FORCED!]' : '') : '');
	if (Odi.conf('debug')) {
		confUpdate.debug = Odi.conf('debug');
		log.enableDebug();
		enableDebugCountdown();
	}
	Odi.descriptor = descriptor;
	Flux = require(Odi._CORE + 'Flux.js').attach(descriptor.modules);
	Flux.next('interface|runtime|update', confUpdate, { delay: 0.5 });
	let fluxToFire = Odi.conf('flux');
	if (fluxToFire) {
		log.table(fluxToFire, 'flux to fire');
		Flux.next(fluxToFire);
	}
	log.info('Odi main object initialized [' + Utils.executionTime(startTime) + 'ms]');
	return Odi;
}

function isAwake() {
	return Odi.conf('mode') != 'sleep';
}

function error(label, data, stackTrace) {
	Flux.next('interface|led|altLeds', { speed: 30, duration: 1.5 }, { hidden: true });
	Flux.next('interface|sound|error', null, { hidden: true });
	log.error(label + '\n', data || '');
	if (stackTrace != false) {
		// Optional ?
		console.trace();
	}
	var logError = {
		label: label,
		data: data,
		time: Utils.logTime()
	};
	// console.log('logError', logError);
	Utils.appendJsonFile(ODI_PATH + 'log/errorHistory.json', logError);
	Odi.errors.push(logError);
}

function enableDebugCountdown() {
	log.info('\u2022\u2022\u2022 DEBUG MODE ' + Odi.conf('debug') + 'min ' + '\u2022\u2022\u2022');
	setInterval(function() {
		let debugTimeout = Odi.conf('debug'); // TODO voir pourquoi ça ne se décrémente pas
		Flux.next('interface|runtime|update', { debug: Odi.conf('debug', debugTimeout--) });
		if (!Odi.conf('debug')) {
			log.DEBUG('>> CANCELING DEBUG MODE... & Restart !!');
			setTimeout(function() {
				process.exit();
			}, 500);
		}
	}, 60 * 1000);
}
