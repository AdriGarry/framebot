#!/usr/bin/env node
"use strict";

var log = new (require(ODI_PATH + "core/Logger.js"))(__filename);
var Utils = require(ODI_PATH + "core/Utils.js");

var fs = require("fs");

var Odi = {
	conf: require(ODI_PATH + "conf.json"),
	setConf: setConf,
	modes: [], // forcedMode, clockMode, alarms...
	setup: {}, // functions ...
	stats: {}, // lastUpdate, totalLines, diskSpace...
	// watch:watch,
	error: error,
	ODI_PATH: "",
	CORE_PATH: ODI_PATH + "core/",
	CONFIG_FILE: ODI_PATH + "conf.json",
	DATA_PATH: ODI_PATH + "data/",
	LOG_PATH: ODI_PATH + "log/",
	WEB_PATH: ODI_PATH + "web/",
	TMP_PATH: ODI_PATH + "tmp/"
};
module.exports = {
	init: init,
	Odi: Odi
};

var Flux = { next: null };

function init(path, forcedDebug) {  // Deprecated ?
	Odi.PATH = path;
	if (forcedDebug) Odi.conf.debug = 'forced';
	log.info('initialization...', Odi.conf.debug ? 'DEBUG' + (Odi.conf.debug == 'forced' ? ' [FORCED!]' : '') : '');
	if (Odi.conf.debug) log.enableDebug();
	log.debug(Odi);
	Flux = require(Odi.CORE_PATH + 'Flux.js');
	return Odi;
}

setTimeout(() => {
	Flux.next('module', 'sound', 'mute', 'MUTE');
	Flux.next('module', 'led', 'blink', 'eye...', 2);
	// Flux.next('service', 'tts', 'speak', 'say something...', 1.5, 3);
}, 500);

/** Function to set/edit Odi's config */
function setConf(newConf, restart, callback) {
	log.info('==>setConf');
	// log.debug('config.update(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	log.debug('config.update(newConf)', newConf);
	Utils.getJsonFileContent(Odi.CONFIG_FILE, function (data) {
		var configFile = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function (key, index) {
			if (configFile[key] != newConf[key]) {
				configFile[key] = newConf[key];
				updatedEntries.push(key);
			}
		});
		global.CONFIG = configFile;
		fs.writeFile(Odi.CONFIG_FILE, JSON.stringify(Odi.conf, null, 2), function () {
			// logArray(updatedEntries);
			if (restart) {
				log.debug('process.exit()');
				process.exit();
			}
			if (callback) callback();
		});
	});
};


function error() {
	log.error(arguments);
	log.error(console.trace());
	// TODO ring & blink
}

function watch(arg) { // DEPRECATED ??
	log.debug("watch()", arg);
}
