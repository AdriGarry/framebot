#!/usr/bin/env node

'use strict';

const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

Core.flux.service.audioRecord.subscribe({
	next: flux => {
		if (flux.id == 'new') {
			addRecord(flux.value);
		} else if (flux.id == 'check') {
			checkRecord(flux.value);
		} else if (flux.id == 'last') {
			playLastRecord(flux.value);
		} else if (flux.id == 'all') {
			playAllRecords(recordListPath);
		} else if (flux.id == 'clear') {
			clearRecords();
		} else if (flux.id == 'trash') {
			trashAllRecords();
		} else Core.error('unmapped flux in Audio Record service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

setImmediate(() => {
	updateRecord();
	log.info('Audio record flag initialized');
	if (!Core.run('alarm')) {
		log.error('Bordel', 'Core.run(alarm)', Core.run('alarm'));
		checkRecord();
	}
});
setInterval(function() {
	updateRecord();
}, 10000);

const RECORD_FILE = Core._TMP + 'record.json';
const DELAY_TO_CLEAR_RECORDS = 60 * 60 * 1000; // TODO as in voicemail?

var lastRecordPath = null,
	recordListPath = [];

function addRecord(path) {
	log.debug('addRecord', path);
	Core.do('interface|tts|speak', { lg: 'en', msg: 'record' }, { hidden: true });
	Utils.execCmd('lame --scale 2 ' + path + ' ' + path + 'UP', () => {
		//TODO -V3 to encode as mp3
		fs.rename(path + 'UP', path, () => {
			lastRecordPath = path;
			recordListPath.push(path);
			Core.run('audioRecord', recordListPath.length);
			Core.do('interface|sound|play', { mp3: path /*,volume: Core.run('volume') * 2*/ }, { hidden: true, delay: 0.2 });
			if (!Core.isAwake()) {
				Utils.appendJsonFile(RECORD_FILE, path);
			}
		});
	});
}

function checkRecord() {
	log.info('checkRecord');
	fs.access(RECORD_FILE, err => {
		if (!err) {
			fs.readFile(RECORD_FILE, (err, data) => {
				let recordPaths = JSON.parse(data);
				log.info('received records', recordPaths);
				recordListPath = recordPaths;
				playAllRecords(recordPaths);
			});
		}
	});
}

function playLastRecord() {
	log.debug('playLastRecord');
	if (!lastRecordPath) {
		Core.do('interface|tts|speak', { lg: 'en', msg: "I don't have any record" });
		return;
	}
	Core.do('interface|sound|play', { mp3: lastRecordPath /*, volume: Core.run('volume') * 3*/ }, { hidden: true });
}

function playAllRecords(recordListPath) {
	log.info('playAllRecords', recordListPath.length);
	if (!recordListPath) {
		Core.do('interface|tts|speak', { lg: 'en', msg: "I don't have any record" });
		return;
	}
	Core.do('interface|tts|speak', { lg: 'en', msg: 'playing all records' });
	let delay = 3,
		previousRecordDuration;
	recordListPath.forEach(recordPath => {
		Utils.getSoundDuration(recordPath, duration => {
			if (previousRecordDuration) {
				delay = delay + previousRecordDuration + 2;
			}
			previousRecordDuration = duration;
			Core.do('interface|sound|play', { mp3: recordPath /*, volume: Core.run('volume') * 3*/ }, { delay: delay });
		});
	});
}

/** Function to update runtime with number of voicemail message(s) */
function updateRecord() {
	try {
		let records = fs.readFileSync(RECORD_FILE, 'UTF-8');
		records = JSON.parse(records);
		Core.run('audioRecord', records.length);
		if (Core.run('audioRecord') > 0) {
			Core.do('interface|led|blink', { leds: ['belly'], speed: 200, loop: 2 }, { hidden: true });
		}
	} catch (e) {
		Core.run('audioRecord', 0);
	}
}

function clearRecords() {
	log.info('clearRecords');
	fs.unlink(RECORD_FILE, function(err) {
		if (err) {
			if (err.code === 'ENOENT') log.info('clearAudioRecord : No record to delete!');
			else Core.error(err);
		} else {
			lastRecordPath = null;
			recordListPath = [];
			Core.do('interface|tts|speak', { lg: 'en', msg: 'records cleared' });
		}
	});
}

function trashAllRecords() {
	log.info('clearRecords');
	Utils.deleteFolderRecursive(Core._UPLOAD);
	recordListPath = [];
	Core.do('interface|tts|speak', { lg: 'en', msg: 'all records deleted' });
}
