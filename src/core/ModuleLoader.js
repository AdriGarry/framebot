#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	CronJobList = require(Core._API + 'CronJobList.js');

var ModuleLoader = {
	loadModules: loadModules,
	setupCron: setupCron
};

module.exports = ModuleLoader;

var loadedModules = {};

function loadModules(modules) {
	Object.keys(modules).forEach(moduleType => {
		let modulesLoaded = _requireModules(moduleType, modules[moduleType].base);
		if (Core.isAwake() && modules[moduleType].hasOwnProperty('full')) {
			modulesLoaded += ', ' + _requireModules(moduleType, modules[moduleType].full);
		}
		log.info(moduleType, 'loaded [' + modulesLoaded + ']');
	});
	return ModuleLoader;
}

function _requireModules(moduleType, moduleArray) {
	let modulesLoadedList = '';
	for (let i = 0; i < moduleArray.length; i++) {
		loadedModules[moduleArray[i]] = require(Core._MODULES + moduleType + '/' + moduleArray[i] + '.js');
	}
	modulesLoadedList += moduleArray.join(', ');
	return modulesLoadedList;
}

function setupCron() {
	let cronList = _organizeCron();
	let moduleCrons = new CronJobList(cronList, 'from modules');
	moduleCrons.start();
}

function _organizeCron() {
	let cronList = [];
	Object.keys(loadedModules).forEach(mod => {
		if (loadedModules[mod].cron) {
			if (Array.isArray(loadedModules[mod].cron.base)) cronList.push.apply(cronList, loadedModules[mod].cron.base);
			if (Array.isArray(loadedModules[mod].cron.full) && Core.isAwake())
				cronList.push.apply(cronList, loadedModules[mod].cron.full);
		}
	});
	return cronList;
}
