#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

const subject = { type: 'module', id: 'hardware' };

var Flux = require(Odi.CORE_PATH + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');

Flux.module.hardware.subscribe({
	next: flux => {
		if (flux.id == 'updateOdiSoftwareInfo') {
			updateOdiSoftwareInfo(flux.value);
		}
		log.info('Hardware module', flux);
	},
	error: err => {
		Odi.error(flux);
	}
});

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
				Odi.setConf(newConf, false);
				// }
			});
		});
	});
}

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
