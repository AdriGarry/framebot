#!/usr/bin/env node
'use strict';

var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');

var fs = require('fs');

var Odi = {
	conf: require(ODI_PATH + 'conf.json'),
	setConf: setConf,
	logArray: logArray,
	modes: [], // forcedMode, clockMode, alarms...
	setup: {}, // functions ...
	stats: {}, // lastUpdate, totalLines, diskSpace...
	error: error,
	errorHistory: [],
	ttsMessages: require(ODI_PATH + 'data/ttsMessages.json'),
	ODI_PATH: '',
	CORE_PATH: ODI_PATH + 'src/core/',
	CONFIG_FILE: ODI_PATH + 'conf.json',
	DATA_PATH: ODI_PATH + 'data/',
	LOG_PATH: ODI_PATH + 'log/',
	TMP_PATH: ODI_PATH + 'tmp/',
	WEB_PATH: ODI_PATH + 'src/web/'
};
module.exports = {
	init: init,
	Odi: Odi
};

var Flux = { next: null };

function init(path, forcedDebug) {
	Odi.PATH = path;
	if (forcedDebug) Odi.conf.debug = 'forced';
	logArray();
	log.info('initialization...', Odi.conf.debug ? 'DEBUG' + (Odi.conf.debug == 'forced' ? ' [FORCED!]' : '') : '');
	if (Odi.conf.debug) log.enableDebug();
	Flux = require(Odi.CORE_PATH + 'Flux.js');
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)') };
	if (Odi.conf.debug) {
		confUpdate.debug = Odi.conf.debug;
	}
	// setConf(confUpdate, false);
	Flux.next('module', 'hardware', 'updateOdiSoftwareInfo', confUpdate, 2);
	return Odi;
}

/** Function to set/edit Odi's config */
function setConf(newConf, restart, callback) {
	log.info('Updating conf:', newConf, restart);
	Utils.getJsonFileContent(Odi.CONFIG_FILE, function(data) {
		var configFile = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key, index) {
			if (configFile[key] != newConf[key]) {
				configFile[key] = newConf[key];
				updatedEntries.push(key);
			}
		});
		Odi.conf = configFile;
		fs.writeFile(Odi.CONFIG_FILE, JSON.stringify(Odi.conf, null, 1), function() {
			logArray(updatedEntries);
			if (restart) {
				log.debug('process.exit()');
				process.exit();
			}
			if (callback) callback();
		});
	});
}
/** Function to set/edit Odi's DEFAULT config */
// function setDefaultConf(newConf, restart, callback) {
// 	log.info('Updating conf:', newConf, restart);
// 	setConf;
// }

/** Function to log CONFIG array */
function logArray(updatedEntries) {
	var col1 = 11,
		col2 = 16;
	if (updatedEntries) log.info();
	var logArrayMode = updatedEntries ? '|         CONFIG UPDATE          |' : '|             CONFIG             |';
	var confArray = '|--------------------------------|\n' + logArrayMode + '\n|--------------------------------|\n';
	Object.keys(Odi.conf).forEach(function(key, index) {
		if (key == 'alarms') {
			Object.keys(Odi.conf[key]).forEach(function(key2, index2) {
				if (key2 != 'd') {
					var c1 = index2 > 0 ? ' '.repeat(col1) : key + ' '.repeat(col1 - key.toString().length);
					var c2 = key2 + ' ' + (Odi.conf[key][key2].h < 10 ? ' ' : '') + Odi.conf[key][key2].h + ':';
					c2 += (Odi.conf[key][key2].m < 10 ? '0' : '') + Odi.conf[key][key2].m;
					if (typeof Odi.conf[key][key2].mode === 'string') c2 += ' ' + Odi.conf[key][key2].mode.charAt(0); //String(Odi.conf[key][key2].mode).charAt(0)
					confArray += '| ' + c1 + ' | ' + c2 + ' '.repeat(col2 - c2.length) + ' |\n';
				}
			});
		} else {
			var updated = updatedEntries && Utils.searchStringInArray(key, updatedEntries) ? true : false;
			confArray +=
				'| ' +
				(!updated ? '' : '*') +
				key +
				' '.repeat(col1 - key.length - updated) /*(updatedEntries.indexOf(key) == -1 ? ' ' : '*')*/ +
				' | ' +
				Odi.conf[key] +
				' '.repeat(col2 - Odi.conf[key].toString().length) +
				' |\n';
		}
	});
	console.log(confArray + '|--------------------------------|');
}

function error() {
	// TODO here: ring & blink
	Odi.errorHistory.unshift(arguments);
	log.error(arguments);
	var trace = console.trace();
	// console.log(trace);
	var logError = {
		error: arguments[0],
		// trace: new Error().stack,
		time: Utils.logTime()
	};
	Utils.appendJsonFile(ODI_PATH + 'log/errors.log', logError);
}
