#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');

Flux.service.system.subscribe({
	next: flux => {
		// console.log(' ==> flux=', flux);
		if (flux.id == 'restart') {/* || flux.id == 'restartOdi'*/
			// console.log('TOTO');
			restartOdi(flux.value);
		} else if (flux.id == 'reboot') {
			reboot();
		} else if (flux.id == 'shutdown') {
			shutdown();
		} else if (flux.id == 'updateOdiSoftwareInfo') {
			updateOdiSoftwareInfo(flux.value);
		} else {
			log.info('System flux not mapped', flux);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function to restart/sleep Odi's core */
function restartOdi(mode) {
	log.info('restartOdi()', mode || '');
	Odi.update({ mode: mode || 'ready' }, true);
}

/** Function to update Odi\'s software params (last date & time, totalLines) */
function updateOdiSoftwareInfo(newConf) {
	// log.info('newConf=', newConf);
	if (!newConf) newConf = {};
	log.info("Updating Odi's software infos (last date & time, totalLines)");
	getLastModifiedDate([ODI_PATH + 'src/'], function(lastUpdate) {
		newConf.update = lastUpdate;
		countSoftwareLines(function(totalLines) {
			newConf.totalLines = totalLines;
			getDiskSpace(function(diskSpace) {
				newConf.diskSpace = diskSpace;
				// if(CONFIG.totalLines != totalLines || CONFIG.update != lastUpdate || CONFIG.diskSpace != diskSpace){ // TODO delete this test and write on conf files only if updatedEntries.lentgh > 0
				// Odi.setDefaultConf({ update: lastUpdate, totalLines: totalLines, diskSpace: diskSpace }, false);
				Odi.update(newConf, false);
				// }
			});
		});
	});
}

/** Function to reboot RPI */
function reboot(){
	if(Odi.conf.mode == 'ready'){
		Flux.next('module', 'sound', 'mute');
		Flux.next('module', 'tts', 'speak', {msg:'Je redaimarre'});
	}
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	setTimeout(function(){
		spawn('sh', [Odi._SHELL + 'power.sh', 'reboot']);
	}, 2000);
};

/** Function to shutdown RPI */
function shutdown(){
	if(Odi.conf.mode == 'ready'){
		Flux.next('module', 'sound', 'mute');
		Flux.next('module', 'tts', 'speak', {msg:'Arret system'});
	}
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI  -- DON\'T FORGET TO SWITCH OFF POWER SUPPLY !!');
	setTimeout(function(){
		spawn('sh', [CORE_PATH + 'sh/power.sh']);
	}, 2000);
};


/** Function to update last modified date & time of Odi's files */
function getLastModifiedDate(paths, callback) {
	// typeof paths => Array
	paths = paths.join(' ');
	Utils.execCmd('find ' + paths + ' -exec stat \\{} --printf="%y\\n" \\; | sort -n -r | head -n 1', function(data) {
		var lastDate = data.match(/[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}/g);
		log.debug('getLastModifiedDate()', lastDate[0]);
		callback(lastDate[0]);
	});
}

/** Function to count lines of Odi's software */
function countSoftwareLines(callback) {
	var extensions = ['js', 'json', 'properties', 'sh', 'py', 'html', 'css']; //, 'properties'
	var typesNb = extensions.length;
	var totalLines = 0;
	extensions.forEach(function(item, index) {
		var temp = item;
		Utils.execCmd('find /home/pi/odi/ -name "*.' + temp + '" -print | xargs wc -l', function(data) {
			var regex = /(\d*) total/g;
			var result = regex.exec(data);
			var t = result && result[1] ? result[1] : -1;
			totalLines = parseInt(totalLines) + parseInt(t);
			typesNb--;
			if (!typesNb) {
				log.debug('countSoftwareLines()', totalLines);
				callback(totalLines);
			}
		});
	});
}

/** Function to retreive disk space on /dev/root */
function getDiskSpace(callback) {
	Utils.execCmd('df -h', function(data) {
		var diskSpace = data.match(/\/dev\/root.*[%]/gm);
		diskSpace = diskSpace[0].match(/[\d]*%/g);
		log.debug('getDiskSpace()', diskSpace[0]);
		callback(diskSpace);
	});
}
