#!/usr/bin/env node

'use strict';

const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);
const Lock = require(_PATH + 'src/core/Lock.js');
const Utils = require(_PATH + 'src/core/Utils.js');
const fs = require('fs');
const spawn = require('child_process').spawn;
const CORE_DEFAULT = require(_PATH + 'const/coreDefault.json');

var Core = {};

module.exports = {
	init: initializeContext,
	Core: Core
};

function setUpCoreObject(Core, descriptor) {
	Core.Name = descriptor.name;
	Core.name = descriptor.name.toLowerCase();
	for (let path in descriptor.paths) {
		// Setting _PATHS
		Core[path] = _PATH + descriptor.paths[path];
	}
	Core._CONF = _PATH + '_' + descriptor.name.toLowerCase() + '/';
	Core.conf = new Lock(require(Core._TMP + 'conf.json'), Core._TMP + 'conf.json');
	Core.run = new Lock(CORE_DEFAULT.runtime);
	Core.isAwake = isAwake;
	Core.descriptor = descriptor; // TODO useless?
	Core.default = CORE_DEFAULT;
	Core.error = error;
	Core.errors = [];
	Core.gpio = require(Core._CONF + 'gpio.json');
	Core.ttsMessages = require(Core._CONF + 'ttsMessages.json');
	return Core;
}

function initializeContext(path, descriptor, forcedParams, startTime) {
	Core = setUpCoreObject(Core, descriptor);
	if (Core.isAwake()) {
		spawn('sh', [_PATH + 'src/shell/init.sh']);
		spawn('sh', [_PATH + 'src/shell/sounds.sh', 'odi', 'noLeds']);
	}

	let packageJson = require(_PATH + 'package.json');
	var confUpdate = {
			startTime: Utils.logTime('h:m (D/M)')
		},
		runtimeUpdate = {},
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
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	console.log('\n' + fs.readFileSync(Core._CONF + Core.Name + '.logo', 'utf8').toString());
	log.table(Core.conf(), 'CONFIG');
	log.info('initialization...');

	if (Core.conf('log') != 'info') log.level(Core.conf('log'));

	if (descriptor.conf && typeof descriptor.conf == 'object') {
		Object.keys(descriptor.conf).forEach(key => {
			// );
			// if (!Core.conf().hasOwnProperty(key) || Core.conf(key) !== Core.conf().hasOwnProperty(key)) {
			// if (!Core.conf().hasOwnProperty(key)) {
			if (Core.conf(key) == '.' || Core.conf(key) == {}) {
				// if (JSON.stringify(Core.conf(key)) != JSON.stringify(descriptor.conf[key])) {
				confUpdate[key] = descriptor.conf[key];
			}
		});
	}
	if (descriptor.runtime && typeof descriptor.runtime == 'object') {
		Object.keys(descriptor.runtime).forEach(key => {
			runtimeUpdate[key] = descriptor.runtime[key];
		});
	}
	// Core.descriptor = descriptor;

	let Flux = require(Core._CORE + 'Flux.js').attach(descriptor.modules);
	Core.flux = Flux;
	Core.do = Flux.next;
	Core.do('interface|runtime|update', confUpdate, {
		delay: 0.5
	});
	Core.do('interface|runtime|refresh', runtimeUpdate);
	let fluxToFire = Core.conf('flux'); // TODO do this !
	if (fluxToFire && fluxToFire.length > 0) {
		log.table(fluxToFire, 'flux to fire');
		Core.do(fluxToFire);
	}

	process.on('uncaughtException', function(err) {
		Core.error('Uncaught Exception', err, false);
	});

	log.info('Core context initialized [' + Utils.executionTime(startTime) + 'ms]');
	Flux.loadModules(descriptor.modules);
	Object.seal(Core);
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
