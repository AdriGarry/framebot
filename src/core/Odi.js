#!/usr/bin/env node
'use strict';

const log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
const Lock = require(ODI_PATH + 'src/core/Lock.js');
const Utils = require(ODI_PATH + 'src/core/Utils.js');
const fs = require('fs');

var Odi = {};
function buildOdiObject(Odi, descriptor) {
	//Object.assign(cible, ...sources) //https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Object/assign
	Odi.conf = new Lock(require(ODI_PATH + 'tmp/conf.json'), ODI_PATH + 'tmp/conf.json');
	Odi.isAwake = isAwake;
	Odi.run = new Lock(descriptor.runtime);
	Odi.descriptor = descriptor; // TODO useless?
	Odi.error = error;
	Odi.errors = [];
	Odi.gpio = require(ODI_PATH + 'data/gpio.json');
	Odi.ttsMessages = require(ODI_PATH + 'data/ttsMessages.json');
	for (let path in descriptor.paths) {
		// Setting _PATHS
		Odi[path] = ODI_PATH + descriptor.paths[path];
	}
	return Odi;
}
module.exports = {
	init: initOdi,
	Odi: Odi
};

var Flux = { next: null };
function initOdi(path, descriptor, forcedParams, startTime) {
	Odi = buildOdiObject(Odi, descriptor);
	let packageJson = require(ODI_PATH + 'package.json');
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)') },
		forcedParamsLog = '';
	if (confUpdate.version != packageJson.version) {
		confUpdate.version = packageJson.version;
	}
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
