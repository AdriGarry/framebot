#!/usr/bin/env node

'use strict';

const fs = require('fs');

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const RandomBox = require('randombox').RandomBox;
const CALENDAR = require(Core._DATA + 'calendar-fr.json');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [
      //{ cron: '0 0 12 * * 0', flux: { id: 'service|interaction|civilHorn' } },
      { cron: '13 0 1,13 * * *', flux: { id: 'service|interaction|uneHeure' } }
    ]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'random', fn: randomAction },
  { id: 'exclamation', fn: exclamation },
  { id: 'demo', fn: demo },
  { id: 'weekDayTTS', fn: weekDayTTS },
  { id: 'uneHeure', fn: uneHeure },
  { id: 'russia', fn: russia },
  { id: 'russiaHymn', fn: russiaHymn },
  { id: 'civilHorn', fn: civilHorn }
];

Observers.attachFluxParseOptions('service', 'interaction', FLUX_PARSE_OPTIONS);

const RANDOM_ACTIONS = [
  { id: 'interface|tts|speak', weight: 7 },
  { id: 'service|interaction|exclamation', weight: 4 },
  { id: 'service|time|now', weight: 2 },
  { id: 'service|time|today', weight: 1 },
  { id: 'service|interaction|weekDayTTS', weight: 2 },
  { id: 'service|weather|random', weight: 4 },
  { id: 'interface|hardware|cpuTTS', weight: 1 },
  { id: 'service|time|age', weight: 1 },
  { id: 'service|max|playOneMelody', weight: 5 },
  { id: 'service|max|hornRdm', weight: 5 }
];

/** Building randomActionList from RANDOM_ACTIONS */
let randomActionList = [];
for (const element of RANDOM_ACTIONS) {
  let loop = element.weight;
  while (loop) {
    randomActionList.push(element);
    loop--;
  }
}

let actionRandomBox = new RandomBox(randomActionList),
  exclamationRandomBox,
  russiaExclamationRandomBox;

fs.readdir(Core._MP3 + 'exclamation', (err, files) => {
  exclamationRandomBox = new RandomBox(files);
});
fs.readdir(Core._MP3 + 'exclamation_russia', (err, files) => {
  russiaExclamationRandomBox = new RandomBox(files);
});

/** Function random action (exclamation, random TTS, time, day, weather...) */
let lastAction;
function randomAction() {
  let nextAction;
  do {
    nextAction = actionRandomBox.next();
  } while (nextAction === lastAction);
  lastAction = nextAction;
  try {
    log.info('randomAction:', nextAction.id, '[' + nextAction.weight + ']');
    new Flux(nextAction.id, nextAction.data);
  } catch (err) {
    new Flux('interface|sound|volume', 50);
    new Flux('interface|tts|speak', 'sa i est, je suis tomber sur le fameux bug!');
    log.test('nextAction', nextAction);
    log.test('err', err);
    Core.error('ACTION TO DEBUG =>', { nextAction: nextAction, err: err }); // TODO
  }
}

function exclamation() {
  log.info('Exclamation');
  new Flux('interface|led|blink', { leds: ['eye'], speed: Utils.random(40, 100), loop: 6 }, { log: 'trace' });
  let newtExclamation = exclamationRandomBox.next();
  new Flux('interface|sound|play', {
    file: 'exclamation/' + newtExclamation
  });
}

function civilHorn() {
  log.info('Civil Horn');
  new Flux('interface|led|blink', { leds: ['eye', 'belly'], speed: 90, loop: 50 }, { log: 'trace' });
  new Flux('interface|arduino|connect');
  new Flux('interface|sound|play', {
    file: 'civilHorn.mp3'
  });
  new Flux('service|max|hornSiren', null, { delay: 3.2 });
}

function russia() {
  log.info('Russia !');
  let russiaExclamation = russiaExclamationRandomBox.next();
  new Flux('interface|sound|play', {
    file: 'exclamation_russia/' + russiaExclamation
  });
}

function russiaHymn() {
  log.info('Russia Hymn!');
  new Flux('interface|sound|play', {
    file: 'playlists/jukebox/HymneSovietique.mp3'
  });
}

function uneHeure() {
  log.info('Il est 1 heure et tout va bien !');
  new Flux('interface|sound|play', {
    file: 'system/uneHeure.mp3',
    volume: 40
  });
}

function demo() {
  log.INFO('Starting Demo !');
  Core.ttsMessages.demo.forEach(tts => {
    new Flux('interface|tts|speak', tts);
  });
}

function weekDayTTS() {
  let TTS_1 = "Si aujourdh'ui on est ";
  let TTS_2 = 'Alors, demain on sera ';
  let dayOfWeek = new Date().getDay();
  new Flux('interface|tts|speak', TTS_1 + CALENDAR.days[dayOfWeek]);
  new Flux('interface|tts|speak', TTS_2 + (CALENDAR.days[dayOfWeek + 1] || CALENDAR.days[0]));
}
