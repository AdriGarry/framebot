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
    Flux.do('interface|tts|speak', 'Ciao');
    stopHomeOffice();
  }).start();
}

function stopHomeOffice() {
  log.info('Stopping home office');
  Core.run('homeOffice', false);
  Flux.do('interface|tts|speak', { lg: 'en', msg: 'Stopping home office and restarting...' });
  Flux.do('service|powerPlug|toggle', { plug: 'plug1', mode: false });
  Flux.do('service|context|restart', null, { delay: 5 });
}

function setupHomeOffice() {
  log.info('Setting up home office...');

  // Desktop plug ON
  Flux.do('service|powerPlug|toggle', { plug: 'plug1', mode: true });

  // Radiator ON for 8 hours if not disabled
  if (Core.conf('radiator') !== 'off') Flux.do('service|radiator|timeout', { mode: 'on', timeout: 8 * 60 });

  setQuietModeDuringLunchTime();
  setInteractions();
}

function setInteractions() {
  // Mood
  Flux.do('service|mood|set', HOME_OFFICE_MOOD_LEVEL);

  // Daily meeting
  new CronJob('0 30 9 * * *', function () {
    Flux.do('interface|tts|speak', 'Daily avec les collègues dans 5 minutes');
    Flux.do('interface|tts|speak', 'Daily avec les collègues dans 4 minutes', { delay: 60 });
    Flux.do('interface|tts|speak', 'Daily avec les collègues dans 3 minutes', { delay: 2 * 60 });
    Flux.do('interface|tts|speak', 'Daily avec les collègues dans 2 minutes', { delay: 3 * 60 });
    Flux.do('interface|tts|speak', 'Daily avec les collègues dans 1 minute', { delay: 4 * 60 });
    Flux.do('interface|tts|speak', 'Daily avec les collègues dans 30 secondes', { delay: 4 * 60 + 30 });
    Flux.do('interface|tts|speak', "C'est l'heure du daily avec les collègues !", { delay: 5 * 60 });
  }).start();

  // Clockwork ~each 16min
  Flux.do('service|time|now', null, { delay: 16 * 60, loop: 30 });

  // Random TTS ~each 13min
  Flux.do('interface|tts|speak', null, { delay: 13 * 60, loop: 20 });

  // Exclamations ~each 19min
  Flux.do('service|interaction|exclamation', null, { delay: 19 * 60, loop: 20 });

  new CronJob('0 5 16 * * *', function () {
    Flux.do('interface|tts|speak', 'Et un brin de toilette ?');
    Flux.do('interface|tts|speak', 'Sans oublier les dents !');
  }).start();

  // Go pickup Louloutes
  new CronJob('0,30 15,16 17 * * *', function () {
    Flux.do('service|max|hornSiren');
    Flux.do('interface|tts|speak', 'Go chercher les Louloutes!', { delay: 5 });
  }).start();
}

function setQuietModeDuringLunchTime() {
  new CronJob('0 15 12 * * *', function () {
    Flux.do('interface|tts|speak', { lg: 'en', msg: 'Quiet mode until 2pm...' });
    Flux.do('service|mood|set', 0, { delay: 5 });
  }).start();
  new CronJob('55 59 13 * * *', function () {
    Flux.do('service|mood|set', HOME_OFFICE_MOOD_LEVEL);
  }).start();
}
