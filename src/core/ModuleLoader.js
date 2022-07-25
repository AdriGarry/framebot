#!/usr/bin/env node

'use strict';

const Core = require('./Core.js').api;
const Logger = require('../api/Logger.js'),
  CronJobList = require('../api/CronJobList.js');

const log = new Logger(__filename);

module.exports = class ModuleLoader {
  constructor(modules) {
    this.modules = modules;
  }

  load() {
    Object.keys(this.modules).forEach(moduleType => {
      let modulesLoaded = _requireModules(moduleType, this.modules[moduleType].base);
      if (Core.isAwake() && this.modules[moduleType].hasOwnProperty('full')) {
        modulesLoaded += ', ' + _requireModules(moduleType, this.modules[moduleType].full);
      }
      log.info(moduleType, 'loaded [' + modulesLoaded + ']');
    });
  }

  setupCron() {
    let cronList = _organizeCron();
    let moduleCrons = new CronJobList(cronList, 'from modules');
    moduleCrons.start();
  }
};

let loadedModules = {};

function _requireModules(moduleType, moduleArray) {
  let modulesLoadedList = '';
  for (const moduleToLoad of moduleArray) {
    loadedModules[moduleToLoad] = require(Core._MODULES + moduleType + '/' + moduleToLoad + '.js');
  }
  modulesLoadedList += moduleArray.join(', ');
  return modulesLoadedList;
}

function _organizeCron() {
  let cronList = [];
  Object.keys(loadedModules).forEach(mod => {
    if (loadedModules[mod].cron) {
      if (Array.isArray(loadedModules[mod].cron.base)) cronList.push.apply(cronList, loadedModules[mod].cron.base);
      if (Array.isArray(loadedModules[mod].cron.full) && Core.isAwake()) cronList.push.apply(cronList, loadedModules[mod].cron.full);
    }
  });
  return cronList;
}
