#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const log = new (require(_PATH + 'src/core/Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js'),
	Lock = require(_PATH + 'src/core/Lock.js'),
	CORE_DEFAULT = require(_PATH + 'data/coreDefault.json');
// const CoreError = require(_PATH + 'src/core/CoreError.js');

var Core = {},
	CoreError;

module.exports = {
	initializeContext: initializeContext,
	Core: Core
};

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
	Core.default = CORE_DEFAULT;
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
		runtimeUpdate = {},
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
	log.info('Context initializing...');

	if (Core.conf('log') != 'info') log.level(Core.conf('log'));

	if (descriptor.conf && typeof descriptor.conf == 'object') {
		Object.keys(descriptor.conf).forEach(key => {
			if (Core.conf(key) == '.') {
				confUpdate[key] = descriptor.conf[key];
			}
		});
	}
	if (descriptor.runtime && typeof descriptor.runtime == 'object') {
		Object.keys(descriptor.runtime).forEach(key => {
			runtimeUpdate[key] = descriptor.runtime[key];
		});
	}

	const Flux = require(Core._CORE + 'Flux.js').init(descriptor.modules),
		ModuleLoader = require(Core._CORE + 'ModuleLoader.js'); //.init(descriptor.modules)
	Core.flux = Flux;
	Core.do = Flux.next;
	Core.do('service|context|update', confUpdate, { delay: 0.2, log: 'debug' });
	Core.do('interface|hardware|runtime', runtimeUpdate, { log: 'debug' });
	let fluxToFire = Core.conf('flux'); // TODO do this !
	if (fluxToFire && fluxToFire.length > 0) {
		log.table(fluxToFire, 'flux to fire');
		Core.do(fluxToFire);
	}

	// process.on('uncaughtException', function(err) {
	// 	Core.error('Uncaught Exception', err, false);
	// });

	log.info('Core context initialized [' + Utils.executionTime(startTime) + 'ms]');
	ModuleLoader.loadModules(descriptor.modules);
	log.info('All modules listening');
	ModuleLoader.setupCronAndApi();
	Object.seal(Core);
	return Core;
}

function isAwake() {
	return Core.conf('mode') != 'sleep';
}

function error(message, data, stackTrace) {
	if (!CoreError) {
		CoreError = require(_PATH + 'src/core/CoreError.js');
	}
	new CoreError(message, data, stackTrace);
}
