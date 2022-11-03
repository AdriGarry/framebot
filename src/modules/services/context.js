#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Files, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [{ cron: '5 0 0 * * *', flux: { id: 'service|context|goToSleep' } }]
  }
};

Observers.attachFluxParser('service', 'context', contextHandler);

function contextHandler(flux) {
  if (flux.id == 'restart') {
    restartCore(flux.value);
  } else if (flux.id == 'sleep') {
    restartCore('sleep');
  } else if (flux.id == 'goToSleep') {
    goToSleep();
  } else if (flux.id == 'update') {
    updateConf(flux.value, false);
  } else if (flux.id == 'updateRestart') {
    updateConf(flux.value, true);
  } else if (flux.id == 'reset') {
    resetConf();
  } else Core.error('unmapped flux in Context service', flux, false);
}

/** Function to restart/sleep Core */
function restartCore(mode) {
  log.info('restarting Core...', mode);
  if (typeof mode !== 'string') mode = 'ready';
  if (Core.run('timer')) {
    let timerRemaining = 'Minuterie ' + Core.run('timer') + ' secondes';
    Flux.do('interface|tts|speak', timerRemaining);
    log.INFO(timerRemaining);
  }
  setTimeout(() => {
    Flux.do('service|context|updateRestart', { mode: mode });
  }, 100);
}

/** Function to random TTS good night, and sleep */
function goToSleep() {
  if (Core.isAwake()) {
    Flux.do('interface|tts|speak', 'Bonne nuit mes loulous');
    log.info('AutoLifeCycle go to sleep !');
    setTimeout(function () {
      Flux.do('service|context|restart', 'sleep');
    }, 5 * 1000);
  }
}

/** Function to set/edit Core's config SYNC */
function updateConf(newConf, restart) {
  let updatedEntries = [];
  Object.keys(newConf).forEach(key => {
    updatedEntries.push(key);
    Core.conf(key, newConf[key], restart, true);
  });
  log.table(Core.conf(), 'CONFIG', updatedEntries);
  if (restart) {
    Flux.do('interface|sound|mute');
    processExit();
  }
}

/** Function to reset conf (& /tmp directory) */
function resetConf() {
  Flux.do('interface|sound|reset');
  Files.deleteFolderRecursive(Core._TMP);
  log.INFO('reset conf and restart');
  processExit();
}

function processExit() {
  Flux.do('service|task|beforeRestart');
  log.info('buttonStats:', Core.run('stats.buttons'));
  log.info('fluxCount:', Core.run('stats.fluxCount'));
  log.info('badRequestCount:', Core.run('stats.badRequestCount'), '\n');
  log.INFO('exit program.');
  setTimeout(() => {
    process.exit();
  }, 1000);
}
