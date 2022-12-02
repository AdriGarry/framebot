#!/usr/bin/env node

'use strict';

const fs = require('fs');

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'start', fn: startWatch },
  { id: 'stop', fn: stopWatch },
  { id: 'toggle', fn: toggleWatch }
];

Observers.attachFluxParseOptions('interface', 'watcher', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  if (Core.conf('watcher')) startWatch();
});

const SEC_TO_RESTART = 3,
  PATHS_TO_WATCH = [
    _PATH,
    Core._SRC,
    Core._CORE,
    Core._API,
    Core._MODULES + 'interfaces/',
    Core._MODULES + 'interfaces/server/',
    Core._MODULES + 'services/',
    Core._SRC + 'test/',
    Core._DATA,
    Core._CONF
  ];
let watchers = [];

function toggleWatch() {
  if (Core.conf('watcher')) stopWatch();
  else startWatch();
}

function startWatch() {
  log.info('Starting watchers on', PATHS_TO_WATCH);
  PATHS_TO_WATCH.forEach(path => {
    watchers.push(addWatcher(path, relaunch));
  });
  Core.conf('watcher', true);
  setTimeout(() => {
    log.info('Auto stopping watcher after one hour...');
    Flux.do('interface|watcher|stop');
  }, 60 * 60 * 1000);
}

function stopWatch() {
  log.info('Stopping watchers', PATHS_TO_WATCH);
  watchers.forEach(watcher => {
    removeWatcher(watcher);
  });
  Core.conf('watcher', false);
}

let timer;

function addWatcher(path, action) {
  return fs.watch(path, { recursive: false }, (eventType, filename) => {
    if (eventType) {
      if (!timer) {
        timer = new Date();
      }
      let logInfo = path.match(/\/(\w*)\/$/g);
      log.info(eventType, logInfo[0] || logInfo, filename, '[' + Utils.executionTime(timer) + 'ms]');
      waitForUpdateEnd(action);
    }
  });
}

function removeWatcher(watcher) {
  watcher.close();
}

let watchTimeout;
function waitForUpdateEnd(action) {
  log.debug('waiting for update end (' + SEC_TO_RESTART + 's)...');
  // TODO use debounce or throttle
  // EXAMPLE: let throttleBadRequestTTS = Scheduler.throttle(badRequestTTS, BAD_REQUEST_TTS_THROTTLE, true, false, this);
  clearTimeout(watchTimeout);
  watchTimeout = setTimeout(() => {
    action();
  }, SEC_TO_RESTART * 1000);
}

function relaunch() {
  log.INFO('>> relaunching...');
  Flux.do('service|context|restart', Core.conf('mode'));
}
