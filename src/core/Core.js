#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const Lock = require('./Lock');

const logger = require('./../api/Logger'),
	Utils = require('./../api/Utils'),
	CORE_DEFAULT = require(_PATH + 'data/coreDefault.json');
// const CoreError = require(_PATH + 'src/api/CoreError.js');

const log = new logger(__filename);

var Core = {},
	CoreError;

module.exports = {
	initializeContext: initializeContext,
	Core: Core
};

// TODO to class => singleton or static ?
function _setUpCoreObject(Core, descriptor, startTime) {
	Core.Name = descriptor.name;
	Core.name = descriptor.name.toLowerCase();
	Core.startTime = startTime;
	for (let path in CORE_DEFAULT.paths) {
		// Setting _PATHS
		Core[path] = _PATH + CORE_DEFAULT.paths[path];
	}
	Core.url = descriptor.url;
	Core._CONF = _PATH + '_' + descriptor.name.toLowerCase() + '/';
	Core.conf = new Lock(require(Core._TMP + 'conf.json'), Core._TMP + 'conf.json');
	Core.run = new Lock(CORE_DEFAULT.runtime);
	Core.isAwake = isAwake;
	Core.descriptor = descriptor;
	Core.error = error;
	// Core.Error = CoreError;
	Core.errors = [];
	Core.gpio = require(Core._CONF + 'gpio.json');
	Core.ttsMessages = require(Core._CONF + 'ttsMessages.json');
	return Core;
}

function initializeContext(path, descriptor, forcedParams, startTime) {
	Core = _setUpCoreObject(Core, descriptor, startTime);

	let packageJson = require(_PATH + 'package.json');
	let confUpdate = {
			startTime: Utils.logTime('h:m (D/M)')
		},
		forcedParamsLog = '';
	if (Core.conf('version') !== packageJson.version) {
		confUpdate.version = packageJson.version;
	}
	if (forcedParams.sleep) {
		Core.conf('mode', 'sleep');
		confUpdate.mode = 'sleep';
		forcedParamsLog += 'sleep ';
	}
	if (forcedParams.debug) {
		log.level('debug');
		forcedParamsLog += 'debug ';
	}
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	console.log('\n' + fs.readFileSync(Core._CONF + 'logo.txt', 'utf8').toString());
	log.table(Core.conf(), 'CONFIG');
	if (Core.isAwake()) {
		spawn('mplayer', ['-volume', 50, Core._MP3 + 'system/startup.mp3']);
	}
	log.info('Core context initializing...');

	if (Core.conf('log') != 'info') log.level(Core.conf('log'));

	if (descriptor.conf && typeof descriptor.conf == 'object') {
		Object.keys(descriptor.conf).forEach(key => {
			if (Core.conf(key) == '.') {
				confUpdate[key] = descriptor.conf[key];
			}
		});
	}

	const Observers = require('./../api/Observers');
	Observers.init(descriptor.modules);

	const Flux = require('../api/Flux.js'),
		ModuleLoader = require('./ModuleLoader.js');

	Core.flux = Flux;
	Core.do = Flux.next;
	new Flux('service|context|update', confUpdate, { delay: 0.2, log: 'debug' });

	log.info('Core context initialized [' + Utils.executionTime(startTime) + 'ms]');
	let moduleLoader = new ModuleLoader(descriptor.modules);
	moduleLoader.load();
	log.info('all modules loaded [' + Utils.executionTime(Core.startTime) + 'ms]');

	new Flux('controller|server|start', null, { log: 'trace' });
	moduleLoader.setupCron();
	Object.seal(Core);
	return Core;
}

function isAwake() {
	return Core.conf('mode') != 'sleep';
}

function error(message, data, stackTrace) {
	if (!CoreError) {
		CoreError = require(_PATH + 'src/api/CoreError.js');
	}
	new CoreError(message, data, stackTrace);
}
