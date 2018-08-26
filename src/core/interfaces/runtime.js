#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const Utils = require(_PATH + 'src/core/Utils.js');
const Flux = require(Core._CORE + 'Flux.js');
const fs = require('fs');

Flux.interface.runtime.subscribe({
	next: flux => {
		if (flux.id == 'update') {
			updateConf(flux.value, false);
		} else if (flux.id == 'updateRestart') {
			updateConf(flux.value, true);
		} else if (flux.id == 'reset') {
			resetCore();
		} else if (flux.id == 'refresh') {
			refreshRuntime(flux.value);
		} else Core.error('unmapped flux in Runtime interface', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

/** Function to set/edit Core's config SYNC */
function updateConf(newConf, restart) {
	let updateBegin = new Date();
	let updatedEntries = [];
	Object.keys(newConf).forEach(key => {
		updatedEntries.push(key);
		Core.conf(key, newConf[key], restart, true);
	});
	let header = 'CONFIG UPDATE' + ' '.repeat(3) + Utils.executionTime(updateBegin, '    ') + 'ms';
	log.table(Core.conf(), header, updatedEntries);
	// log.table(Core.run(), 'RUNTIME...');
	if (restart) process.exit();
}

/** Function to reset Core (/tmp/ directory) */
function resetCore() {
	Flux.next('interface|sound|reset');
	Utils.deleteFolderRecursive(Core._TMP);
	log.INFO('reset conf and restart');
	// log.table(Core.run(), 'RUNTIME...');
	process.exit();
}

/** Function to refresh Core\'s runtime data (etat, timer, moods...) */
function refreshRuntime() {
	log.info("refreshing Core's runtime...");
	Flux.next('interface|hardware|runtime', null, { hidden: true });
	setTimeout(function() {
		log.table(Core.run(), 'RUNTIME...');
	}, 1000);
}
