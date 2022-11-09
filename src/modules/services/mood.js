#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Scheduler } = require('./../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '0 0 22 * * *', flux: { id: 'service|mood|set', data: 1 } }]
  }
};

const FLUX_PARSE_OPTIONS = [{ id: 'set', fn: setMoodLevel, condition: { isAwake: true } }];

Observers.attachFluxParseOptions('service', 'mood', FLUX_PARSE_OPTIONS);

const MOOD_LEVELS = {
  0: { volume: 0 }, // muted
  1: { volume: 30 }, // system tts: clock, and others human triggered functions (timer...)
  2: { volume: 50 },
  3: { volume: 60 }, // max + interaction
  4: { volume: 80 }, // screen/diapo
  5: { volume: 90 } // party mode + pirate
};

const DEFAULT_MOOD_LEVEL = Core.run('mood'),
  HOURS_BACK_TO_DEFAULT_LEVEL = 6;

function setMoodLevel(newMoodLevelId) {
  log.info('Setting mood level to', newMoodLevelId);
  Core.run('mood', newMoodLevelId);
  Flux.do('interface|sound|volume', MOOD_LEVELS[newMoodLevelId].volume);
  if (newMoodLevelId > DEFAULT_MOOD_LEVEL) schedulingBackToDefaultMoodLevel();
  additionalMoodSetup(newMoodLevelId);
}

function schedulingBackToDefaultMoodLevel() {
  log.info('Scheduling back to default mood level (' + DEFAULT_MOOD_LEVEL + ') in ' + HOURS_BACK_TO_DEFAULT_LEVEL + ' hours');
  Scheduler.delay(HOURS_BACK_TO_DEFAULT_LEVEL * 60 * 60).then(backToDefaultMoodLevel);
}

function backToDefaultMoodLevel() {
  log.info('Back to default mood level:', DEFAULT_MOOD_LEVEL);
  setMoodLevel(DEFAULT_MOOD_LEVEL);
}

function additionalMoodSetup(moodLevelId) {
  if (moodLevelId >= 2) {
    Flux.do('interface|tts|speak', { lg: 'en', voice: 'google', msg: 'Mood level ' + moodLevelId });
    Flux.do('interface|arduino|connect');
  }

  if (moodLevelId >= 3) {
    scheduleFluxWhileMoodLevel(3, 13, { id: 'service|interaction|random' });
  } else if (Core.run('max')) {
    Flux.do('interface|arduino|disconnect');
  }

  if (moodLevelId >= 4) {
    // HDMI (video loop)
    Flux.do('interface|video|loop');
    scheduleFluxWhileMoodLevel(4, 9, { id: 'service|interaction|random' });
  } else if (Core.run('screen')) {
    Flux.do('interface|hdmi|off');
  }

  if (moodLevelId === 5) {
    // Party
    Flux.do('service|party|start');
    scheduleFluxWhileMoodLevel(5, 7, { id: 'service|party|pirate' });
  }
}

function scheduleFluxWhileMoodLevel(moodLevelLimit, minutesInterval, flux) {
  log.info(`Scheduling flux '${flux.id}', at mood level limit ${moodLevelLimit}, each ${minutesInterval} minutes`);
  Flux.do(flux.id, flux.data);
  let interval = setInterval(() => {
    if (Core.run('mood') >= moodLevelLimit) Flux.do(flux.id, flux.data);
    else clearInterval(interval);
  }, minutesInterval * 60 * 1000);
}
