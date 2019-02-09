#!/usr/bin/env node

'use strict';

const util = require('util'),
	Rx = require('rxjs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js');

// const LOG_LEVELS = ['info', 'debug', 'trace'];
// var ready = false;

var Flux = {
	init: attachObservers,
	loadModules: loadModules
};

module.exports = Flux;

function attachObservers(observers) {
	log.debug('initializing observers...');
	Object.keys(observers).forEach((key, index) => {
		let proto = key.substring(0, key.length - 1);
		Flux[proto] = {};
		Object.keys(observers[key]).forEach((key2, index2) => {
			let tmp = observers[key][key2];
			tmp.forEach(index => {
				Flux[proto][index] = new Rx.Subject();
			});
		});
	});
	ready = true;
	log.info('Flux manager ready');
	return Flux;
}

function loadModules(modules) {
	Object.keys(modules).forEach(function(moduleId) {
		let modulesLoaded = '';
		for (let i = 0; i < modules[moduleId].base.length; i++) {
			require(Core._CORE + moduleId + '/' + modules[moduleId].base[i] + '.js');
		}
		modulesLoaded += modules[moduleId].base.join(', ');
		if (Core.isAwake() && modules[moduleId].hasOwnProperty('full')) {
			for (let i = 0; i < modules[moduleId].full.length; i++) {
				require(Core._CORE + moduleId + '/' + modules[moduleId].full[i] + '.js');
			}
			modulesLoaded += ', ' + modules[moduleId].full.join(', ');
		}
		log.info(moduleId, 'loaded [' + modulesLoaded + ']');
	});
	return Flux;
}
