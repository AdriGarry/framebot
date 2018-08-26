#!/usr/bin/env node
'use strict';

const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);
const Lock = require(_PATH + 'src/core/Lock.js');
const Utils = require(_PATH + 'src/core/Utils.js');
const fs = require('fs');

var Core = {};
function setUpContext(Core, descriptor) {
	//Object.assign(cible, ...sources) //https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Object/assign
	Core.name = descriptor.name;
	Core.conf = new Lock(require(_PATH + 'tmp/conf.json'), _PATH + 'tmp/conf.json');
	Core.isAwake = isAwake;
	Core.run = new Lock(descriptor.runtime);
	Core.descriptor = descriptor; // TODO useless?
	Core.error = error;
	Core.errors = [];
	Core.gpio = require(_PATH + 'data/gpio.json');
	Core.ttsMessages = require(_PATH + 'data/ttsMessages.json');
	for (let path in descriptor.paths) {
		// Setting _PATHS
		Core[path] = _PATH + descriptor.paths[path];
	}
	return Core;
}
module.exports = {
	init: init,
	Core: Core
};

var Flux = { next: null };
function init(path, descriptor, forcedParams, startTime) {
	Core = setUpContext(Core, descriptor);
	let packageJson = require(_PATH + 'package.json');
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)') },
		forcedParamsLog = '';
	if (confUpdate.version != packageJson.version) {
		confUpdate.version = packageJson.version;
	}
	if (forcedParams.sleep) {
		Core.conf('mode', 'sleep');
		confUpdate.mode = 'sleep';
		forcedParamsLog += 'sleep ';
	}
	if (forcedParams.debug) {
		forcedParamsLog += 'debug ';
	}
	const logo = fs
		.readFileSync(_PATH + 'data/' + (!Core.isAwake() ? 'odiSleep' : 'odi') + '.logo', 'utf8')
		.toString()
		.split('\n');
	console.log('\n' + logo.join('\n'));
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	log.table(Core.conf(), 'CONFIG');
	log.info('initialization...');
	//, Core.conf('debug') ? 'DEBUG' + (Core.conf('debug') == 'forced' ? ' [FORCED!]' : '') : ''); //TODO recup le forced

	if (Core.conf('log') != 'info') log.level(Core.conf('log'));

	Core.descriptor = descriptor;
	Flux = require(Core._CORE + 'Flux.js').attach(descriptor.modules);
	Flux.next('interface|runtime|update', confUpdate, { delay: 0.5 });
	let fluxToFire = Core.conf('flux');
	if (fluxToFire && fluxToFire.length > 0) {
		log.table(fluxToFire, 'flux to fire');
		Flux.next(fluxToFire);
	}
	log.info('Core context initialized [' + Utils.executionTime(startTime) + 'ms]');
	return Core;
}

function isAwake() {
	return Core.conf('mode') != 'sleep';
}

process.on('uncaughtException', function(err) {
	Core.error('Uncaught Exception', err, false);
});

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
	Utils.appendJsonFile(_PATH + 'log/errorHistory.json', logError);
	Core.errors.push(logError);
}
