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
	Core.do('interface|sound|play', { mp3: path, volume: Core.run('volume') * 3 }, { delay: 1, hidden: true });
	lastRecordPath = path;
	recordListPath.push(path);
}

function playLastRecord() {
	log.debug('playLastRecord');
	if (!lastRecordPath) {
		Core.do('interface|tts|speak', { lg: 'en', msg: "I don't have any record" });
		return;
	}
	Core.do('interface|sound|play', { mp3: lastRecordPath, volume: Core.run('volume') * 3 }, { hidden: true });
}

function playAllRecords() {
	log.info('playAllRecords', recordListPath.length);
	if (!lastRecordPath) {
		Core.do('interface|tts|speak', { lg: 'en', msg: "I don't have any record" });
		return;
	}
	Core.do('interface|tts|speak', { lg: 'en', msg: 'playing all records' });
	let delay = 3000;
	// recordListPath.forEach(recordPath => {
	for (let i = 0; i < recordListPath.length; i++) {
		log.info('---> TO FIX', delay, recordListPath[i]);
		Core.do('interface|sound|play', { mp3: recordListPath[i], volume: Core.run('volume') * 3 }, { delay: delay });
		delay = delay + 5 * 1000; // TODO...
	}
}

function cleanRecords() {
	log.info('cleanRecords');
	Utils.deleteFolderRecursive(Core._UPLOAD);
	recordListPath = [];
	Core.do('interface|tts|speak', { lg: 'en', msg: 'all records deleted' });
}
