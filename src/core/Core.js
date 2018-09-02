#!/usr/bin/env node

'use strict';

const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);
const Lock = require(_PATH + 'src/core/Lock.js');
const Utils = require(_PATH + 'src/core/Utils.js');
const fs = require('fs');
const CORE_DEFAULT = require(_PATH + 'data/coreDefault.json');

var Core = {};

function setUpCoreObject(Core, descriptor) {
	//Object.assign(cible, ...sources) //https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Object/assign
	Core.name = descriptor.name;
	for (let path in descriptor.paths) {
		// Setting _PATHS
		Core[path] = _PATH + descriptor.paths[path];
	}
	Core.conf = new Lock(require(Core._TMP + 'conf.json'), Core._TMP + 'conf.json');
	Core.run = new Lock(CORE_DEFAULT.runtime);
	Core.isAwake = isAwake;
	Core.descriptor = descriptor; // TODO useless?
	Core.error = error;
	Core.errors = [];
	Core.gpio = require(Core._CONF + 'gpio.json');
	Core.ttsMessages = require(Core._CONF + 'ttsMessages.json');
	return Core;
}
module.exports = {
	init: initializeContext,
	Core: Core
};

var Flux = {
	next: null
};

function initializeContext(path, descriptor, forcedParams, startTime) {
	Core = setUpCoreObject(Core, descriptor);
	let packageJson = require(_PATH + 'package.json');
	var confUpdate = {
			startTime: Utils.logTime('h:m (D/M)')
		},
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
		.readFileSync(Core._CONF + Core.name + '.logo', 'utf8')
		.toString()
		.split('\n');
	console.log('\n' + logo.join('\n'));
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	log.table(Core.conf(), 'CONFIG');
	log.info('Core initialization...');
	//, Core.conf('debug') ? 'DEBUG' + (Core.conf('debug') == 'forced' ? ' [FORCED!]' : '') : ''); //TODO recup le forced

	if (Core.conf('log') != 'info') log.level(Core.conf('log'));

	if (descriptor.conf && typeof descriptor.conf == 'object') {
		Object.keys(descriptor.conf).forEach(key => {
			confUpdate[key] = descriptor.conf[key];
		});
	}
	Core.descriptor = descriptor;

	Flux = require(Core._CORE + 'Flux.js').attach(descriptor.modules);
	Core.do = Flux.next;
	Core.do('interface|runtime|update', confUpdate, {
		delay: 0.5
	});
	let fluxToFire = Core.conf('flux'); // TODO do this !
	if (fluxToFire && fluxToFire.length > 0) {
		log.table(fluxToFire, 'flux to fire');
		Core.do(fluxToFire);
	}

	process.on('uncaughtException', function(err) {
		Core.error('Uncaught Exception', err, false);
	});

	log.info('Core context initialized [' + Utils.executionTime(startTime) + 'ms]');
	return Core;
}

function isAwake() {
	return Core.conf('mode') != 'sleep';
}

function error(label, data, stackTrace) {
	Core.do(
		'interface|led|altLeds',
		{
			speed: 30,
			duration: 1.5
		},
		{
			hidden: true
		}
	);
	Core.do('interface|sound|error', null, {
		hidden: true
	});
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
