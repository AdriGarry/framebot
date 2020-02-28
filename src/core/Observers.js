#!/usr/bin/env node

'use strict';

const util = require('util'),
	Rx = require('rxjs');

const log = new (require('../api/Logger.js'))(__filename.match(/(\w*).js/g)[0]);

var ready = false,
	modulesTypes = [],
	ObserversObjects = { controller: {}, interface: {}, service: {} };

module.exports = class Observers {
	static init(observers) {
		log.debug('initializing observers...');

		Object.keys(observers).forEach((key, index) => {
			let proto = key.substring(0, key.length - 1);
			modulesTypes.push(proto);
			ObserversObjects[proto] = {};

			Object.keys(observers[key]).forEach((key2, index2) => {
				let tmp = observers[key][key2];
				tmp.forEach(index => {
					ObserversObjects[proto][index] = new Rx.Subject();
				});
			});
		});
		ready = true;
		log.info('Observers attached, flux manager ready');
		return ObserversObjects;
	}

	static isReady() {
		return ready;
	}

	static modules() {
		return modulesTypes;
	}

	static controller() {
		return ObserversObjects.controller;
	}

	static interface() {
		return ObserversObjects.interface;
	}

	static service() {
		return ObserversObjects.service;
	}
};
