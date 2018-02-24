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
		} else Odi.error('unmapped flux in Watcher controller', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

const PATHS = [Odi._SRC, Odi._DATA];

function startWatch() {
	log.info('starting watchers on', PATHS);
	PATHS.forEach(path => {
		addWatcher(path, relaunch);
	});
	Odi.conf('watcher', true);
}

var timer;
function addWatcher(path, action) {
	fs.watch(path, { encoding: 'buffer' }, eventType => {
		if (eventType) {
			// console.log('eventType', eventType);
			if (!timer) {
				timer = new Date();
			}
			let logInfo = path.match(/\/(\w*)\/$/g);
			log.info('updating', logInfo[0] || logInfo, '[' + Utils.executionTime(timer) + 'ms]');
			waitForUpdateEnd(action);
		}
	});
}

var watchTimeout;
function waitForUpdateEnd(action) {
	// log.info('waiting for update end...');
	clearTimeout(watchTimeout);
	watchTimeout = setTimeout(() => {
		action();
	}, 1000);
}

function relaunch() {
	log.INFO('>> relaunching...');
	// Flux.next('interface', 'runtime', 'updateRestart', { mode: mode || 'ready' });
	Flux.next('service', 'system', 'restart');
}
