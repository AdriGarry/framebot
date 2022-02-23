#!/usr/bin/env node
'use strict';

const CronJob = require('cron').CronJob;

const { Core, Flux, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [{ cron: '* 30 8 1,2 * *', flux: { id: 'service|homeOffice|start' } }]
  }
};

const FLUX_PARSE_OPTIONS = [{ id: 'start', fn: startHomeOffice }];

Observers.attachFluxParseOptions('service', 'homeOffice', FLUX_PARSE_OPTIONS);

const HOME_OFFICE_MOOD_LEVEL = 3;

function startHomeOffice() {
  if (Core.run('homeOffice')) {
    log.info('Homeoffice already activated');
    return;
  }
  log.info('Starting Homeoffice');
  Core.run('homeOffice', true);
  setupHomeOffice();
  new CronJob('* 16 17 * * *', function () {
    stopHomeOffice();
  }).start();
}

function stopHomeOffice() {
  log.info('Stopping home office');
  Core.run('homeOffice', false);
  new Flux('interface|tts|speak', { lg: 'en', msg: 'Stopping home office and restarting...' });
  new Flux('service|powerPlug|toggle', { plug: 'plugA', mode: false });
  new Flux('service|context|restart', null, { delay: 5 });
}

function setupHomeOffice() {
  log.info('setupHomeOffice');

  // Desktop plug ON ~after 10 sec
  new Flux('service|powerPlug|toggle', { plug: 'plugA', mode: true }, { delay: 10 });

  // Radiator ON for 6 hours
  new Flux('service|radiator|timeout', { mode: 'on', timeout: 6 * 60 });

  setQuietModeDuringLunchTime();
  setInteractions();
}

function setInteractions() {
  // Mood
  new Flux('service|mood|set', HOME_OFFICE_MOOD_LEVEL);

  // Clockwork ~each 13min
  new Flux('service|time|now', null, { delay: 13 * 60, loop: 30 });

  new CronJob('* 5 16 * * *', function () {
    new Flux('interface|tts|speak', 'Et un brin de toilette ?');
    new Flux('interface|tts|speak', 'Sans oublier les dents !');
  }).start();

  // Russia ~each 50min
  new Flux('service|interaction|russia', null, { delay: 50 * 60, loop: 10 });

  // Go pickup Louloutes
  new CronJob('* 15 17 * * *', function () {
    new Flux('service|max|playHornSiren');
    new Flux('interface|tts|speak', 'Go chercher les Louloutes!', { delay: 5 });
  }).start();
}

function setQuietModeDuringLunchTime() {
  new CronJob('* 15 12 * * *', function () {
    new Flux('interface|tts|speak', { lg: 'en', msg: 'Quiet mode until 2pm...' });
    new Flux('service|mood|set', 0, { delay: 5 });
  }).start();
  new CronJob('* 0 14 * * *', function () {
    new Flux('service|mood|set', HOME_OFFICE_MOOD_LEVEL);
  }).start();
}
