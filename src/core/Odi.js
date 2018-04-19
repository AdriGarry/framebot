#!/usr/bin/env node
'use strict';

const log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
const Lock = require(ODI_PATH + 'src/core/Lock.js');
const Utils = require(ODI_PATH + 'src/core/Utils.js');
const fs = require('fs');

var _runtime = {
	etat: null,
	volume: null,
	max: null,
	mood: [],
	music: false,
	alarm: false,
	timer: 0,
	voicemail: null,
	screen: null,
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
	conf: new Lock(require(ODI_PATH + 'tmp/conf.json'), ODI_PATH + 'tmp/conf.json'),
	isAwake: isAwake,
	run: new Lock(_runtime),
	error: error,
	errors: [],
	gpio: require(ODI_PATH + 'data/gpio.json'),
	ttsMessages: require(ODI_PATH + 'data/ttsMessages.json'),
	_SRC: ODI_PATH + 'src/',
	_CORE: ODI_PATH + 'src/core/',
	_SHELL: ODI_PATH + 'src/shell/',
	_WEB: ODI_PATH + 'src/web/',
	_DATA: ODI_PATH + 'data/',
	_MP3: ODI_PATH + 'media/mp3/',
	_VIDEO: ODI_PATH + 'media/video/',
	_PHOTO: ODI_PATH + 'media/photo/',
	_LOG: ODI_PATH + 'log/',
	_TMP: ODI_PATH + 'tmp/',
	_CONF: ODI_PATH + 'tmp/conf.json'
};
module.exports = {
	init: initOdi,
	Odi: Odi
};

var Flux = { next: null };
function initOdi(path, descriptor, forcedParams, startTime) {
	Odi.PATH = path;
	let packageJson = require(ODI_PATH + 'package.json');
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)'), version: packageJson.version },
		forcedParamsLog = '';
	if (forcedParams.sleep) {
		Odi.conf('mode', 'sleep');
		confUpdate.mode = 'sleep';
		forcedParamsLog += 'sleep ';
	}
	if (forcedParams.debug) {
		forcedParamsLog += 'debug ';
	}
	const logo = fs
		.readFileSync(ODI_PATH + 'data/' + (!Odi.isAwake() ? 'odiSleep' : 'odi') + '.logo', 'utf8')
		.toString()
		.split('\n');
	console.log('\n' + logo.join('\n'));
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	log.table(Odi.conf(), 'CONFIG');
	log.info('initialization...');
	//, Odi.conf('debug') ? 'DEBUG' + (Odi.conf('debug') == 'forced' ? ' [FORCED!]' : '') : ''); //TODO recup le forced

	if (Odi.conf('log') != 'info') log.level(Odi.conf('log'));

	Odi.descriptor = descriptor;
	Flux = require(Odi._CORE + 'Flux.js').attach(descriptor.modules);
	Flux.next('interface|runtime|update', confUpdate, { delay: 0.5 });
	let fluxToFire = Odi.conf('flux');
	if (fluxToFire && fluxToFire.length > 0) {
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
	Utils.appendJsonFile(ODI_PATH + 'log/errorHistory.json', logError);
	Odi.errors.push(logError);
}
