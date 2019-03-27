#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js');

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
	let toLoad = _organizeCronAndApi();
	_setupCronJobs(toLoad.cronList);
	_setupWebApi(toLoad.apiList);
}

function _organizeCronAndApi() {
	let cronList = [],
		apiList = [];
	// log.info(cronAndApi);
	Object.keys(cronAndApi).forEach(mod => {
		if (cronAndApi[mod].cron && Array.isArray(cronAndApi[mod].cron.base))
			cronList.push.apply(cronList, cronAndApi[mod].cron.base);
		if (cronAndApi[mod].cron && Array.isArray(cronAndApi[mod].cron.full)) {
			cronList.push.apply(cronList, cronAndApi[mod].cron.full);
		}
		// apiList.push(cronAndApi[mod].api);
	});
	return { cronList, apiList };
}

function _setupWebApi(apiList) {
	log.warn('setupWebApi... TO IMPLEMENT !!!', apiList);
}

function _setupCronJobs(cronJobs) {
	log.info('setupCronJobs');
	// log.debug(cronJobs);
	Core.do('controller|cron|add', cronJobs, { delay: 1, log: 'debug' });
	// cronJobs.forEach(job => {
	// 	Core.do('controller|cron|add', job, { log: 'debug' });
	// });
}
