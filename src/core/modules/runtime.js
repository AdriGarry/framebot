#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;
var fs = require('fs');

Flux.module.runtime.subscribe({
	next: flux => {
		if (flux.id == 'update') {
			updateConf(flux.value, false);
		} else if (flux.id == 'updateRestart') {
			updateConf(flux.value, true);
		} else if (flux.id == 'reset') {
			resetCfg(flux.value);
		} else if (flux.id == 'refresh') {
			refreshRuntime(flux.value);
		} else Odi.error('unmapped flux in Conf service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function to set/edit Odi's config SYNC */
function updateConf(newConf, restart) {
	let updateBegin = new Date();
	let updatedEntries = [];
	Object.keys(newConf).forEach(key => {
		updatedEntries.push(key);
		Odi.conf(key, newConf[key], restart, true);
	});
	let header = 'CONFIG UPDATE' + ' '.repeat(3) + Utils.getExecutionTime(updateBegin, '    ') + 'ms';
	log.table(Odi.conf(), header, updatedEntries);
	if (restart) process.exit();
}

/** Function to reset Odi's config */
function resetCfg(restart) {
	log.info('resetCfg()', restart ? 'and restart' : '');
	var stream = fs.createReadStream(Odi._DATA + 'defaultConf.json'); /*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	var had_error = false;
	stream.on('error', function(e) {
		had_error = true;
		log.error('config.resetCfg() stream error', e); // Odi.error();
	});
	stream.on('close', function() {
		if (!had_error && restart) {
			process.exit();
		}
	});
}

/** Function to refresh Odi\'s runtime data (etat, timer, moods...) */
function refreshRuntime() {
	log.info("refreshing Odi's runtime...");
	Flux.next('module', 'hardware', 'runtime', null, null, null, true);
	// Flux.next('controller', 'button', 'runtime', null, null, true);
	// Flux.next('module', 'hardware', '');
	setTimeout(function() {
		log.table(Odi.run(), 'RUNTIME...');
	}, 1000);
}
