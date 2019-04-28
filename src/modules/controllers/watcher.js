#!/usr/bin/env node

'use strict';

const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

module.exports = {
	api: {
		base: { POST: [{ url: 'watcher', flux: { id: 'controller|watcher|toggle' } }] }
	}
};

Core.flux.controller.watcher.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			startWatch();
		} else if (flux.id == 'stop') {
			stopWatch();
		} else if (flux.id == 'toggle') {
			toggleWatch();
		} else Core.error('unmapped flux in Watcher controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	if (Core.conf('watcher')) {
		Core.do('controller|watcher|start');
	}
});

const PATHS = [
		_PATH,
		Core._SRC,
		Core._CORE,
		Core._MODULES + '/controllers/',
		Core._MODULES + '/interfaces/',
		Core._MODULES + '/services/',
		Core._DATA
	],
	SEC_TO_RESTART = 3;
var watchers = [];

function toggleWatch() {
	if (Core.conf('watcher')) stopWatch();
	else startWatch();
}

function startWatch() {
	log.info('starting watchers on', PATHS);
	PATHS.forEach(path => {
		watchers.push(addWatcher(path, relaunch));
	});
	Core.conf('watcher', true);
}

function stopWatch() {
	log.info('watchers stop', PATHS);
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
	Core.do('service|context|restart', Core.conf('mode'));
}