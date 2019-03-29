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
	Core.do('controller|cron|add', toLoad.cronList, { log: 'debug' }); //delay: 0.1,
	log.info(toLoad.apiList);
	Core.do('controller|server|start', toLoad.apiList, { log: 'debug' }); //delay: 0.1,

	// _setupCronJobs(toLoad.cronList);
	// _setupWebApi(toLoad.apiList);
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
	//startUIServer
	log.info('setupWebApi... TO IMPLEMENT !!!', apiList);
	Core.do('controller|api|start', cronJobs, { log: 'debug' }); //delay: 0.1,
}

// function _setupCronJobs(cronJobs) {
// 	Core.do('controller|cron|add', cronJobs, { log: 'debug' }); //delay: 0.1,
// }
