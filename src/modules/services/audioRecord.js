#!/usr/bin/env node

'use strict';

const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename),
	{ Utils } = require(Core._API + 'api.js');

module.exports = {};

const Observers = require(Core._CORE + 'Observers.js');
Observers.service().audioRecord.subscribe({
	next: flux => {
		if (flux.id == 'new') {
			addRecord(flux.value);
			// TODO tous les flux suivants, les filtrer si mode veille (ou passer par un switch/case ?)
		} else if (flux.id == 'check') {
			checkRecord();
		} else if (flux.id == 'last') {
			playLastRecord();
		} else if (flux.id == 'clear') {
			clearRecords();
		} else if (flux.id == 'trash') {
			trashAllRecords();
		} else Core.error('unmapped flux in Audio Record service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	updateRecord();
	log.info('Audio record flag initialized');
	if (!Core.run('alarm')) {
		checkRecord();
	}
});
setInterval(function() {
	updateRecord();
}, 10000);

const RECORD_FILE = Core._TMP + 'record.json',
	NO_RECORD = 'No record',
	RECORD_TTS = { lg: 'en', msg: 'record' },
	NO_RECORD_TTS = { lg: 'en', msg: "I don't have any record" },
	HOURS_TO_CLEAR_RECORDS = 6;

var lastRecordPath = null,
	recordListPath = [],
	clearAudioRecordDelay;

function addRecord(path) {
	log.debug('addRecord', path);
	Core.do('interface|tts|speak', RECORD_TTS, { log: 'trace' });
	Utils.execCmd('lame --scale 3 ' + path + ' ' + path + 'UP')
		.then(data => {
			//TODO -V3 to encode as mp3
			fs.rename(path + 'UP', path, () => {
				lastRecordPath = path;
				recordListPath.push(path);
				Core.run('audioRecord', recordListPath.length);
				Core.do('interface|sound|play', { mp3: path }, { log: 'trace', delay: 0.2 });
				Utils.appendJsonFile(RECORD_FILE, path);
			});
		})
		.catch(err => {
			Core.error('addRecord error', err);
		});
}

function checkRecord() {
	log.debug('Checking record...');
	Utils.getJsonFileContent(RECORD_FILE)
		.then(data => {
			if (data) {
				// JSON.parse(data);
				updateRecord();
				playAllRecords();
				clearAudioRecordLater();
			} else {
				log.debug(NO_RECORD);
			}
		})
		.catch(err => {
			Core.error('checkRecord error', err);
		});
}

/** Function to update runtime with number of voicemail message(s) */
function updateRecord() {
	try {
		let records = fs.readFileSync(RECORD_FILE, 'UTF-8');
		records = JSON.parse(records);
		lastRecordPath = records[records.length - 1];
		recordListPath = records;
		Core.run('audioRecord', records.length);
		if (Core.run('audioRecord') > 0) {
			Core.do('interface|led|blink', { leds: ['belly'], speed: 200, loop: 2 }, { log: 'trace' });
		}
	} catch (e) {
		Core.run('audioRecord', 0);
	}
}

function playLastRecord() {
	log.debug('playLastRecord');
	if (!lastRecordPath) {
		Core.do('interface|tts|speak', NO_RECORD_TTS);
		return;
	}
	Core.do('interface|sound|play', { mp3: lastRecordPath /*, volume: Core.run('volume') * 3*/ }, { log: 'trace' });
}

function playAllRecords() {
	log.info('playAllRecords', recordListPath.length);
	if (!recordListPath.length) {
		Core.do('interface|tts|speak', NO_RECORD_TTS);
		return;
	}
	Core.do('interface|tts|speak', RECORD_TTS);
	let delay = 1,
		previousRecordDuration;
	recordListPath.forEach(recordPath => {
		Utils.getDuration(recordPath)
			.then(data => {
				if (previousRecordDuration) {
					delay = delay + previousRecordDuration + 2;
				}
				previousRecordDuration = data;
				Core.do('interface|sound|play', { mp3: recordPath /*, volume: Core.run('volume') * 3*/ }, { delay: delay });
			})
			.catch(err => {
				Core.error('playAllRecords error', err);
			});
	});
}

/** Function to schedule voicemail deletion */
function clearAudioRecordLater() {
	if (clearAudioRecordDelay) {
		clearTimeout(clearAudioRecordDelay);
		clearAudioRecordDelay = null;
	}
	clearAudioRecordDelay = setTimeout(function() {
		clearRecords();
	}, HOURS_TO_CLEAR_RECORDS * 60 * 60 * 1000);
	log.info('AudioRecord will be cleared in ' + HOURS_TO_CLEAR_RECORDS + ' hours');
}

function clearRecords(noLog) {
	if (!noLog) log.info('clearRecords');
	fs.unlink(RECORD_FILE, function(err) {
		if (err) {
			if (err.code === 'ENOENT') log.info('clearAudioRecord : No record to delete!');
			else Core.error('Error while deleting records', err);
		} else {
			lastRecordPath = null;
			recordListPath = [];
			if (!noLog) Core.do('interface|tts|speak', { lg: 'en', msg: 'records cleared' });
		}
	});
}

function trashAllRecords() {
	log.info('trashRecords');
	clearRecords(true);
	Utils.deleteFolderRecursive(Core._UPLOAD);
	Core.do('interface|tts|speak', { lg: 'en', msg: 'all records deleted' });
}
