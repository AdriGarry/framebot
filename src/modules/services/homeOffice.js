#!/usr/bin/env node
'use strict';

const CronJob = require('cron').CronJob;

const { Core, Flux, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [{ cron: '0 30 8 * * 1,2', flux: { id: 'service|homeOffice|start' } }]
  }
};

const FLUX_PARSE_OPTIONS = [{ id: 'start', fn: startHomeOffice }],
  HOME_OFFICE_MOOD_LEVEL = 3;

Observers.attachFluxParseOptions('service', 'homeOffice', FLUX_PARSE_OPTIONS);

function startHomeOffice() {
  if (Core.run('homeOffice')) {
    log.info('Homeoffice already activated');
    return;
  }
  log.info('Starting Homeoffice');
  Core.run('homeOffice', true);
  setupHomeOffice();
  new CronJob('0 17 17 * * *', function () {
    new Flux('interface|tts|speak', 'Ciao');
    stopHomeOffice();
  }).start();
}

function stopHomeOffice() {
  log.info('Stopping home office');
  Core.run('homeOffice', false);
  new Flux('interface|tts|speak', { lg: 'en', msg: 'Stopping home office and restarting...' });
  new Flux('service|powerPlug|toggle', { plug: 'plug1', mode: false });
  new Flux('service|context|restart', null, { delay: 5 });
}

function setupHomeOffice() {
  log.info('Setting up home office...');

  // Desktop plug ON
  new Flux('service|powerPlug|toggle', { plug: 'plug1', mode: true });

  // Radiator ON for 6 hours if not disabled
  if (Core.conf('radiator') !== 'off') new Flux('service|radiator|timeout', { mode: 'on', timeout: 6 * 60 });

  setQuietModeDuringLunchTime();
  setInteractions();
}

function setInteractions() {
  // Mood
  new Flux('service|mood|set', HOME_OFFICE_MOOD_LEVEL);

  // Daily meeting
  new CronJob('0 30 9 * * *', function () {
    new Flux('interface|tts|speak', 'Daily avec les collègues dans 5 minutes');
    new Flux('interface|tts|speak', 'Daily avec les collègues dans 4 minutes', { delay: 60 });
    new Flux('interface|tts|speak', 'Daily avec les collègues dans 3 minutes', { delay: 2 * 60 });
    new Flux('interface|tts|speak', 'Daily avec les collègues dans 2 minutes', { delay: 3 * 60 });
    new Flux('interface|tts|speak', 'Daily avec les collègues dans 1 minute', { delay: 4 * 60 });
    new Flux('interface|tts|speak', 'Daily avec les collègues dans 30 secondes', { delay: 4 * 60 + 30 });
    new Flux('interface|tts|speak', "C'est l'heure du daily avec les collègues !", { delay: 5 * 60 });
  }).start();

  // Clockwork ~each 16min
  new Flux('service|time|now', null, { delay: 16 * 60, loop: 30 });

  // Random TTS ~each 13min
  new Flux('interface|tts|speak', null, { delay: 13 * 60, loop: 20 });

  // Exclamations ~each 19min
  new Flux('service|interaction|exclamation', null, { delay: 19 * 60, loop: 20 });

  new CronJob('0 5 16 * * *', function () {
    new Flux('interface|tts|speak', 'Et un brin de toilette ?');
    new Flux('interface|tts|speak', 'Sans oublier les dents !');
  }).start();

  // Go pickup Louloutes
  new CronJob('0,30 15,16 17 * * *', function () {
    new Flux('service|max|hornSiren');
    new Flux('interface|tts|speak', 'Go chercher les Louloutes!', { delay: 5 });
  }).start();
}

function setQuietModeDuringLunchTime() {
  new CronJob('0 15 12 * * *', function () {
    new Flux('interface|tts|speak', { lg: 'en', msg: 'Quiet mode until 2pm...' });
    new Flux('service|mood|set', 0, { delay: 5 });
  }).start();
  new CronJob('55 59 13 * * *', function () {
    new Flux('service|mood|set', HOME_OFFICE_MOOD_LEVEL);
  }).start();
}
