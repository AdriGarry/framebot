#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename);
const Utils = require(ODI_PATH + 'src/core/Utils.js');
const Flux = require(Odi._CORE + 'Flux.js');
const fs = require('fs');

Flux.interface.runtime.subscribe({
	next: flux => {
		if (flux.id == 'update') {
			updateConf(flux.value, false);
		} else if (flux.id == 'updateRestart') {
			updateConf(flux.value, true);
		} else if (flux.id == 'reset') {
			resetOdi(flux.value);
		} else if (flux.id == 'refresh') {
			refreshRuntime(flux.value);
		} else Odi.error('unmapped flux in Runtime interface', flux, false);
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
	let header = 'CONFIG UPDATE' + ' '.repeat(3) + Utils.executionTime(updateBegin, '    ') + 'ms';
	log.table(Odi.conf(), header, updatedEntries);
	if (restart) process.exit();
}

/** Function to reset Odi (/tmp/ directory) */
function resetOdi(restart) {
	Flux.next('interface|sound|reset');
	Utils.deleteFolderRecursive(Odi._TMP);
	log.INFO('reset conf', restart ? 'and restart' : '');
	if (restart) {
		process.exit();
	}
}

/** Function to refresh Odi\'s runtime data (etat, timer, moods...) */
function refreshRuntime() {
	log.info("refreshing Odi's runtime...");
	Flux.next('interface|hardware|runtime', null, { hidden: true });
	setTimeout(function() {
		log.table(Odi.run(), 'RUNTIME...');
	}, 1000);
}
