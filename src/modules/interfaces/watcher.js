#!/usr/bin/env node

'use strict';

const fs = require('fs');

const Core = require('./../../core/Core').Core;

const { Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'start', fn: startWatch },
	{ id: 'stop', fn: stopWatch },
	{ id: 'toggle', fn: toggleWatch }
];

Observers.attachFluxParseOptions('interface', 'watcher', FLUX_PARSE_OPTIONS);

setImmediate(() => {
	if (Core.conf('watcher')) {
		new Flux('interface|watcher|start');
	}
});

const SEC_TO_RESTART = 3,
	PATHS_TO_WATCH = [
		_PATH,
		Core._SRC,
		Core._CORE,
		Core._API,
		Core._MODULES + 'interfaces/',
		Core._MODULES + 'services/',
		Core._SRC + 'test/',
		Core._DATA,
		Core._CONF
	];
var watchers = [];

function toggleWatch() {
	if (Core.conf('watcher')) stopWatch();
	else startWatch();
}

function startWatch() {
	log.info('Starting watchers on', PATHS_TO_WATCH);
	PATHS_TO_WATCH.forEach(path => {
		watchers.push(addWatcher(path, relaunch));
	});
	Core.conf('watcher', true);
}

function stopWatch() {
	log.info('Stopping watchers', PATHS_TO_WATCH);
	watchers.forEach(watcher => {
		removeWatcher(watcher);
	});
	Core.conf('watcher', false);
}

var timer;

function addWatcher(path, action) {
	let watcher = fs.watch(path, { recursive: true }, (eventType, filename) => {
		if (eventType) {
			if (!timer) {
				timer = new Date();
			}
			let logInfo = path.match(/\/(\w*)\/$/g);
			log.info(eventType, logInfo[0] || logInfo, filename, '[' + Utils.executionTime(timer) + 'ms]');
			waitForUpdateEnd(action);
		}
	});
	return watcher;
}

function removeWatcher(watcher) {
	watcher.close();
}

var watchTimeout;
function waitForUpdateEnd(action) {
	log.debug('waiting for update end (' + SEC_TO_RESTART + 's)...');
	clearTimeout(watchTimeout);
	watchTimeout = setTimeout(() => {
		action();
	}, SEC_TO_RESTART * 1000);
}

function relaunch() {
	log.INFO('>> relaunching...');
	new Flux('service|context|restart', Core.conf('mode'));
}
