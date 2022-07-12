#!/usr/bin/env node

'use strict';

const fs = require('fs');

const { Core, Flux, Logger, Observers, Files, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'new', fn: addRecord },
  { id: 'check', fn: checkRecord },
  { id: 'last', fn: playLastRecord },
  { id: 'clear', fn: clearRecords },
  { id: 'trash', fn: trashAllRecords }
];

Observers.attachFluxParseOptions('service', 'audioRecord', FLUX_PARSE_OPTIONS);

const RECORD_FILE = Core._TMP + 'record.json',
  NO_RECORD = 'No record',
  RECORD_TTS = { lg: 'en', msg: 'record' },
  NO_RECORD_TTS = { lg: 'en', msg: "I don't have any record" },
  HOURS_TO_CLEAR_RECORDS = 12;

setImmediate(() => {
  updateRecord();
  log.info('Audio record flag initialized');
  if (!Core.run('alarm')) {
    checkRecord();
  }
});
setInterval(function () {
  updateRecord();
}, 10000);

var lastRecordPath = null,
  recordListPath = [],
  clearAudioRecordDelay;

function addRecord(path) {
  log.debug('addRecord', path);
  new Flux('interface|tts|speak', RECORD_TTS, { log: 'trace' });
  Utils.execCmd('lame --scale 3 ' + path + ' ' + path + 'UP')
    .then(data => {
      //TODO -V3 to encode as mp3
      fs.rename(path + 'UP', path, () => {
        lastRecordPath = path;
        recordListPath.push(path);
        Core.run('audioRecord', recordListPath.length);
        new Flux('interface|sound|play', { file: path }, { log: 'trace', delay: 0.2 });
        Files.appendJsonFile(RECORD_FILE, path);
      });
    })
    .catch(err => {
      Core.error('addRecord error', err);
    });
}

function checkRecord() {
  log.debug('Checking record...');
  Files.getJsonFileContent(RECORD_FILE)
    .then(data => {
      if (data) {
        // JSON.parse(data);
        updateRecord();
        playAllRecords();
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
      new Flux('interface|led|blink', { leds: ['belly'], speed: 200, loop: 2 }, { log: 'trace' });
    }
  } catch (e) {
    Core.run('audioRecord', 0);
  }
}

function playLastRecord() {
  log.debug('playLastRecord');
  if (!lastRecordPath) {
    new Flux('interface|tts|speak', NO_RECORD_TTS);
    return;
  }
  new Flux('interface|sound|play', { file: lastRecordPath }, { log: 'trace' });
  clearAudioRecordLater();
}

function playAllRecords() {
  log.info('playAllRecords', recordListPath.length);
  if (!recordListPath.length) {
    new Flux('interface|tts|speak', NO_RECORD_TTS);
    return;
  }
  new Flux('interface|tts|speak', RECORD_TTS);
  let delay = 1,
    previousRecordDuration;
  recordListPath.forEach(recordPath => {
    Files.getDuration(recordPath)
      .then(data => {
        if (previousRecordDuration) {
          delay = delay + previousRecordDuration + 2;
        }
        previousRecordDuration = data;
        new Flux('interface|sound|play', { file: recordPath }, { delay: delay });
      })
      .catch(err => {
        Core.error('playAllRecords error', err);
      });
  });
  clearAudioRecordLater();
}

/** Function to schedule voicemail deletion */
function clearAudioRecordLater() {
  if (clearAudioRecordDelay) {
    clearTimeout(clearAudioRecordDelay);
    clearAudioRecordDelay = null;
  }
  clearAudioRecordDelay = setTimeout(function () {
    clearRecords();
  }, HOURS_TO_CLEAR_RECORDS * 60 * 60 * 1000);
  log.info('AudioRecord will be cleared in ' + HOURS_TO_CLEAR_RECORDS + ' hours');
}

function clearRecords(noLog) {
  if (!noLog) log.info('clearRecords');
  fs.unlink(RECORD_FILE, function (err) {
    if (err) {
      if (err.code === 'ENOENT') log.info('clearAudioRecord : No record to delete!');
      else Core.error('Error while deleting records', err);
    } else {
      lastRecordPath = null;
      recordListPath = [];
      if (!noLog) new Flux('interface|tts|speak', { lg: 'en', msg: 'records cleared' });
    }
  });
}

function trashAllRecords() {
  log.info('trashRecords');
  clearRecords(true);
  Files.deleteFolderRecursive(Core._UPLOAD);
  new Flux('interface|tts|speak', { lg: 'en', msg: 'all records deleted' });
}
