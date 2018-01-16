#!/usr/bin/env node
'use strict';

var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var fs = require('fs');

module.exports = {
	init: initOdi,
	Odi: Odi
};

var Odi = {
	status: null,
	conf: require(ODI_PATH + 'conf.json'),
	isAwake: isAwake,
	run: runtimeFunctions,
	stats: null,
	error: error, //require(ODI_PATH + 'src/core/OdiError.json'), ??
	errors: [],
	ttsMessages: require(ODI_PATH + 'data/ttsMessages.json'),
	_SRC: ODI_PATH + 'src/',
	_CORE: ODI_PATH + 'src/core/',
	_SHELL: ODI_PATH + 'src/shell/',
	_WEB: ODI_PATH + 'src/web/',
	_CONF: ODI_PATH + 'conf.json',
	_DATA: ODI_PATH + 'data/',
	_MP3: ODI_PATH + 'media/mp3/',
	_LOG: ODI_PATH + 'log/',
	_TMP: ODI_PATH + 'tmp/'
};

var _runtime = {
		etat: null,
		volume: null,
		max: null,
		mood: [],
		music: false,
		alarm: false,
		timer: 0,
		voicemail: null,
		cpu: {
			usage: null,
			temp: null
		},
		memory: {
			odi: null,
			raspi: null
		}
	},
	_stats = {
		diskSpace: null,
		update: null,
		totalLines: null
	};

/**
 * run(), run(id), run(id, value)
 * @param {*} runtimeId
 * @param {*} newRuntimeValue
 */
var runtimeFunctions = function(runtimeId, newRuntimeValue) {
	if (!runtimeId) return _runtime;
	if (newRuntimeValue) _setRuntimeValue(runtimeId, newRuntimeValue);
	else _getRuntimeValue(runtimeId);
};
var _getRuntimeValue = function(runtimeId) {
	if (_runtime.hasOwnProperty(runtimeId)) {
		return _runtime[runtimeId];
	} else {
		return log.info('_getRuntimeValue ERROR:', runtimeId);
	}
};
var _setRuntimeValue = function(runtimeId, newRuntimeValue) {
	if (_runtime.hasOwnProperty(runtimeId)) {
		//if()
		_runtime[runtimeId] = newRuntimeValue;
		return true;
	} else {
		log.info('_setRuntimeValue ERROR:', runtimeId);
		return false;
	}
};

var Flux = { next: null };
function initOdi(path, forcedParams) {
	Odi.PATH = path;
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)') },
		forcedParamsLog = '';
	if (forcedParams.sleep) {
		Odi.conf.mode = 'sleep';
		confUpdate.mode = 'sleep';
		forcedParamsLog += 'sleep ';
	}
	if (forcedParams.debug) {
		Odi.conf.debug = 'forced';
		forcedParamsLog += 'debug ';
	}
	const logo = fs
		.readFileSync(ODI_PATH + 'data/' + (Odi.conf.mode == 'sleep' ? 'odiLogoSleep' : 'odiLogo') + '.properties', 'utf8')
		.toString()
		.split('\n');
	console.log('\n' + logo.join('\n'));
	if (forcedParams.test) {
		confUpdate.mode = 'test';
		forcedParamsLog += 'test ';
	}
	if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

	log.table(Odi.conf, 'CONFIG');
	log.info('initialization...', Odi.conf.debug ? 'DEBUG' + (Odi.conf.debug == 'forced' ? ' [FORCED!]' : '') : '');
	if (Odi.conf.debug) {
		confUpdate.debug = Odi.conf.debug;
		log.enableDebug();
		enableDebugCountdown();
	}

	Flux = require(Odi._CORE + 'Flux.js');
	Flux.next('module', 'conf', 'update', confUpdate, 0.1);
	return Odi;
}

function isAwake() {
	return Odi.conf.mode != 'sleep';
}

function error(label, data, stackTrace) {
	Flux.next('module', 'led', 'altLeds', { speed: 30, duration: 1.5 }, null, null, 'hidden');
	Flux.next('module', 'sound', 'error', null, null, null, 'hidden');
	log.error(label + '\n', data || '');
	if (stackTrace != false) {
		// Optional ?
		console.trace();
	}
	var logError = {
		label: label,
		data: data,
		time: Utils.logTime()
	};
	// console.log('logError', logError);
	Utils.appendJsonFile(ODI_PATH + 'log/errorHistory.log', logError);
	Odi.errors.push(logError);
}

function enableDebugCountdown() {
	log.info('\u2022\u2022\u2022 DEBUG MODE ' + Odi.conf.debug + 'min ' + '\u2022\u2022\u2022');
	setInterval(function() {
		Flux.next('module', 'conf', 'update', { debug: --Odi.conf.debug });
		if (!Odi.conf.debug) {
			log.DEBUG('>> CANCELING DEBUG MODE... & Restart !!');
			setTimeout(function() {
				process.exit();
			}, 500);
		}
	}, 60 * 1000);
}