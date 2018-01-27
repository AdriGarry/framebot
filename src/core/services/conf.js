#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;
var fs = require('fs');

Flux.module.conf.subscribe({
	next: flux => {
		if (flux.id == 'update') {
			updateConf(flux.value, false);
		} else if (flux.id == 'updateRestart') {
			updateConf(flux.value, true);
		} else if (flux.id == 'updateDefault') {
			updateDefaultConf(flux.value);
		} else if (flux.id == 'reset') {
			resetCfg(flux.value);
		} else if (flux.id == 'runtime') {
			refreshRuntime(flux.value);
		} else Odi.error('unmapped flux in Conf service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function to set/edit Odi's config */
function updateConf(newConf, restart, callback) {
	doUpdate(Odi._CONF, newConf, restart, callback);
}

/** Function to set/edit Odi's DEFAULT config */
function updateDefaultConf(newConf, restart, callback) {
	doUpdate(Odi._DATA + 'defaultConf.json', newConf, restart, callback);
}

var updateBegin;
function doUpdate(file, newConf, restart, callback) {
	updateBegin = new Date();
	log.debug('Updating conf:', newConf, restart);
	Utils.getJsonFileContent(file, function(data) {
		// console.log('-->', Utils.getExecutionTime(updateBegin, true));
		var configFile = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key, index) {
			if (configFile[key] != newConf[key]) {
				configFile[key] = newConf[key];
				updatedEntries.push(key);
			}
		});
		// console.log('-->', Utils.getExecutionTime(updateBegin, true));
		Odi.conf = configFile;
		fs.writeFile(file, JSON.stringify(Odi.conf, null, 1), function() {
			// log.conf(Odi.conf, updatedEntries, Utils.getExecutionTime(updateBegin, '    '));
			log.table(
				Odi.conf,
				'CONFIG UPDATE' + ' '.repeat(8) + Utils.getExecutionTime(updateBegin, '    ') + 'ms',
				updatedEntries
			);
			if (restart) process.exit();
			if (callback) callback();
		});
	});
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
		console.log(Odi.run());
		log.table(Odi.run(), 'RUNTIME...');
	}, 1000);
}
