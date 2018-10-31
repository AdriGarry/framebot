#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

Core.flux.service.audioRecord.subscribe({
	next: flux => {
		if (flux.id == 'new') {
			addRecord(flux.value);
		} else if (flux.id == 'last') {
			playLastRecord(flux.value);
		} else if (flux.id == 'all') {
			playAllRecords(flux.value);
		} else if (flux.id == 'clean') {
			cleanRecords();
		} else Core.error('unmapped flux in Audio Record service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

var lastRecordPath = null,
	recordListPath = [];

function addRecord(path) {
	log.debug('addRecord', path);
	Core.do('interface|tts|speak', { lg: 'en', msg: 'record' });
	Core.do('interface|sound|play', { mp3: path, volume: Core.run('volume') * 3 }, { delay: 1 });
	lastRecordPath = path;
	recordListPath.push(path);
}

function playLastRecord() {
	log.debug('playLastRecord');
	if (!lastRecordPath) {
		Core.do('interface|tts|speak', { lg: 'en', msg: "I don't have any record" });
		return;
	}
	Core.do('interface|sound|play', { mp3: lastRecordPath, volume: Core.run('volume') * 3 });
}

function playAllRecords() {
	log.debug('playAllRecords');
	if (!lastRecordPath) {
		Core.do('interface|tts|speak', { lg: 'en', msg: "I don't have any record" });
		return;
	}
	Core.do('interface|tts|speak', { lg: 'en', msg: 'playing all records' });
	let delay = 0;
	recordListPath.forEach(i => {
		Core.do('interface|sound|play', { mp3: recordListPath[i], volume: Core.run('volume') * 3 }, { delay: delay });
		delay = delay + 5 * 1000;
	});
}

function cleanRecords() {
	log.info('cleanRecords');
	Core.do('interface|tts|speak', { lg: 'en', msg: 'deleting all records' });
	// Core.do('interface|sound|play', { mp3: lastRecordPath, volume: Core.run('volume') * 3 });
	Utils.deleteFolderRecursive(Core._UPLOAD);
}
