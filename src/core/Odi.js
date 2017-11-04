#!/usr/bin/env node
'use strict';

var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');

var fs = require('fs');

var Odi = {
	conf: require(ODI_PATH + 'conf.json'),
	update: update,
	updateDefault: updateDefault,
	reset: resetCfg,
	logArray: logArray,
	modes: [], // forcedMode, clockMode, alarms...
	setup: {}, // functions ...
	stats: {}, // lastUpdate, totalLines, diskSpace...
	error: error,
	errors: [],
	ttsMessages: require(ODI_PATH + 'data/ttsMessages.json'),
	ODI_PATH: '',
	SHELL_PATH: ODI_PATH + 'src/shell/',
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

function init(path, forcedDebug, test) {
	const logo = fs.readFileSync(ODI_PATH + 'data/' + (Odi.conf.mode == 'sleep'? 'odiLogoSleep': 'odiLogo') +'.properties', 'utf8')
	.toString().split('\n');
	console.log('\n' + logo.join('\n'));

	Odi.PATH = path;
	if (forcedDebug) Odi.conf.debug = 'forced';
	logArray();
	log.info('initialization...', Odi.conf.debug ? 'DEBUG' + (Odi.conf.debug == 'forced' ? ' [FORCED!]' : '') : '');
	if (Odi.conf.debug) log.enableDebug();
	var confUpdate = { startTime: Utils.logTime('h:m (D/M)') };
	if (Odi.conf.debug){
		confUpdate.debug = Odi.conf.debug;
		enableDebugCountdown();
	}
	if (test) confUpdate.mode = 'test';

	Flux = require(Odi.CORE_PATH + 'Flux.js');
	Flux.next('service', 'system', 'updateOdiSoftwareInfo', confUpdate, 0.1);
	return Odi;
}

/** Function to set/edit Odi's config */
function update(newConf, restart, callback) {
	doUpdate(Odi.CONFIG_FILE, newConf, restart, callback);
}

/** Function to set/edit Odi's DEFAULT config */
function updateDefault(newConf, restart, callback) {
	doUpdate(ODI_PATH + 'src/data/defaultConf.json', newConf, restart, callback);
}

/** Function to reset Odi's config */
function resetCfg(restart) {
	console.log('resetCfg()', restart ? 'and restart' : '');
	logArray();
	//	config.update = now('dt');

	var stream = fs.createReadStream(Odi.DATA_PATH + 'defaultConf.json'); /*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	var had_error = false;
	stream.on('error', function(e) {
		had_error = true;
		console.error('config.resetCfg() stream error', e);
	});
	stream.on('close', function() {
		if (!had_error && restart) {
			process.exit();
		}
	});
}

var updateBegin;
function doUpdate(file, newConf, restart, callback) {
	updateBegin = new Date();
	log.debug('Updating conf:', newConf, restart);
	Utils.getJsonFileContent(Odi.CONFIG_FILE, function(data) {
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
		fs.writeFile(Odi.CONFIG_FILE, JSON.stringify(Odi.conf, null, 1), function() {
			logArray(updatedEntries, Utils.getExecutionTime(updateBegin, '    '));
			if (restart) process.exit();
			if (callback) callback();
		});
	});
}

/** Function to log CONFIG array */
function logArray(updatedEntries, executionTime) {
	var col1 = 11,
		col2 = 16;
	// log.info();
	var logArrayMode = updatedEntries
		? '|         CONFIG UPDATE   ' + executionTime + 'ms' + ' |'
		: '|             CONFIG             |';
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
	Flux.next('module', 'led', 'altLeds', { speed: 30, duration: 1.5 }, null, null, 'hidden');
	Flux.next('module', 'sound', 'error', null, null, null, 'hidden');
	log.error(arguments);
	console.trace(); // Optional ?
	Odi.errors.unshift(arguments);
	// console.log(trace);
	var logError = {
		error: arguments[0],
		// trace: new Error().stack,
		time: Utils.logTime()
	};
	Utils.appendJsonFile(ODI_PATH + 'log/errors.log', logError);
}

function enableDebugCountdown(){
	log.info('\u2022\u2022\u2022 DEBUG MODE ' + Odi.conf.debug + 'min ' + '\u2022\u2022\u2022');
	//TODO screen on & tail odi.log !
	setInterval(function(){
		Odi.update({debug: --Odi.conf.debug}, false);
		if(!Odi.conf.debug){
			log.DEBUG('>> CANCELING DEBUG MODE... & Restart !!');
			//Odi.update({debug: 0}, true);
			setTimeout(function(){
				process.exit();
			}, 500);
		}
	}, 60*1000);
};
