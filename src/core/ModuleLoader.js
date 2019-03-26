#!/usr/bin/env node

'use strict';

const util = require('util'),
	Rx = require('rxjs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js');

var ModuleLoader = {
	loadModules: loadModules,
	loadModulesJson: loadModulesJson
};

module.exports = ModuleLoader;

var cronAndApi = {};

function loadModules(modules) {
	Object.keys(modules).forEach(moduleType => {
		let modulesLoaded = _loadModulesArray(moduleType, modules[moduleType].base);
		if (Core.isAwake() && modules[moduleType].hasOwnProperty('full')) {
			modulesLoaded += ', ' + _loadModulesArray(moduleType, modules[moduleType].full);
		}
		log.info(moduleType, 'loaded [' + modulesLoaded + ']');
	});
	return ModuleLoader;
}

function _loadModulesArray(moduleType, moduleArray) {
	let modulesLoadedList = '';
	for (let i = 0; i < moduleArray.length; i++) {
		let exportsFromModule = require(Core._CORE + moduleType + '/' + moduleArray[i] + '.js');
		cronAndApi[moduleArray[i]] = exportsFromModule;
	}
	modulesLoadedList += moduleArray.join(', ');
	return modulesLoadedList;
}

function loadModulesJson(modules) {
	let toLoad = _organizeCronAndApi();
	_initCronJobs(toLoad.cronList);
	_initWebApi(toLoad.apiList);
}

function _organizeCronAndApi() {
	let cronList = [],
		apiList = [];
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

function _initWebApi(apiList) {
	log.warn('_initWebApi... TO IMPLEMENT !!!', apiList);
}

function _initCronJobs(cronJobs) {
	log.info('initCronJobs');
	log.debug(cronJobs);
	Core.do('controller|cron|add', cronJobs, { log: 'debug' });
	// cronJobs.forEach(job => {
	// 	Core.do('controller|cron|add', job, { log: 'debug' });
	// });
}
