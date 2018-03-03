#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');

var fs = require('fs');

Flux.controller.watcher.subscribe({
	next: flux => {
		if (flux.id == 'startWatch') {
			startWatch();
		} else if (flux.id == 'stopWatch') {
			stopWatch();
		} else Odi.error('unmapped flux in Watcher controller', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

const PATHS = [Odi._SRC, Odi._DATA];
var watchers = [];

function startWatch() {
	log.info('starting watchers on', PATHS);
	PATHS.forEach(path => {
		watchers.push(addWatcher(path, relaunch));
	});
	Odi.conf('watcher', true);
}

function stopWatch() {
	log.info('watchers stop', PATHS);
	// log.INFO('stopWatch() to implement !');
	watchers.forEach(watcher => {
		removeWatcher(watcher);
	});
	Odi.conf('watcher', false);
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
	// log.info('watcher', watcher, 'removed');
}
var watchTimeout;
function waitForUpdateEnd(action) {
	// log.info('waiting for update end...');
	clearTimeout(watchTimeout);
	watchTimeout = setTimeout(() => {
		action();
	}, 2000);
}

function relaunch() {
	log.INFO('>> relaunching...');
	// Flux.next('interface', 'runtime', 'updateRestart', { mode: mode || 'ready' });
	Flux.next('service', 'system', 'restart', Odi.conf('mode'));
}
