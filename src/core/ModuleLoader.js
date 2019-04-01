#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]);

var ModuleLoader = {
	loadModules: loadModules,
	setupCronAndApi: setupCronAndApi
};

module.exports = ModuleLoader;

var cronAndApi = {};

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
		cronAndApi[moduleArray[i]] = require(Core._CORE + moduleType + '/' + moduleArray[i] + '.js');
	}
	modulesLoadedList += moduleArray.join(', ');
	return modulesLoadedList;
}

function setupCronAndApi(modules) {
	log.info('setup cron and api');
	let toLoad = _organizeCronAndApi();
	Core.do('controller|server|start', toLoad.apiList, { log: 'trace' }); //delay: 0.1,
	Core.do('controller|cron|add', toLoad.cronList, { delay: 0.1, log: 'trace' }); //delay: 0.1,
}

function _organizeCronAndApi() {
	let cronList = [],
		apiList = [];
	Object.keys(cronAndApi).forEach(mod => {
		if (cronAndApi[mod].cron) {
			if (Array.isArray(cronAndApi[mod].cron.base)) cronList.push.apply(cronList, cronAndApi[mod].cron.base);
			if (Array.isArray(cronAndApi[mod].cron.full)) cronList.push.apply(cronList, cronAndApi[mod].cron.full);
		}
		if (cronAndApi[mod].api) {
			if (cronAndApi[mod].api.base) {
				if (Array.isArray(cronAndApi[mod].api.base.GET)) {
					apiList.push.apply(apiList, cronAndApi[mod].api.base.GET);
				}
				if (Array.isArray(cronAndApi[mod].api.base.POST)) {
					apiList.push.apply(apiList, cronAndApi[mod].api.base.POST);
				}
			}
			if (cronAndApi[mod].api.full) {
				if (Array.isArray(cronAndApi[mod].api.full.GET)) {
					apiList.push.apply(apiList, cronAndApi[mod].api.full.GET);
				}
				if (Array.isArray(cronAndApi[mod].api.full.POST)) {
					apiList.push.apply(apiList, cronAndApi[mod].api.full.POST);
				}
			}
		}
	});
	return { cronList, apiList };
}
