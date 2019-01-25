#!/usr/bin/env node

'use strict';

const util = require('util'),
	Rx = require('rxjs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js');

const LOG_LEVELS = ['info', 'debug', 'trace'];

var ready = false;

var Flux = {
	init: attachObservers,
	loadModules: loadModules,
	next: next
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

const FLUX_REGEX = new RegExp(/\w+\|\w+\|\w+/); // TODO

function FluxObject(idFrom, data, conf) {
	try {
		let id = idFrom.split('|');
		if (!conf) conf = {};
		this.type = id[0] || '';
		this.subject = id[1] || '';
		this.id = id[2] || '';
	} catch (err) {
		this.error = 'Invalid Flux structure: ' + idFrom;
	}
	this.value = data;
	this.delay = Number(conf.delay) || 0;
	this.loop = Number(conf.loop) || 1;
	this.log = conf.log || 'info';
	if (!Utils.searchStringInArray(this.log, LOG_LEVELS)) {
		this.error = 'Invalid Flux log level: ' + this.log;
	}

	this.isValid = () => {
		if (this.error) {
			Core.error('Flux error:' + this.error, this);
			return false;
		} else if (!Object.keys(Flux).includes(this.type) || !Object.keys(Flux[this.type]).includes(this.subject)) {
			log.warn('Invalid Flux id: ' + this.type, this.subject);
			return false;
		}
		return true;
		// if (
		// 	!this.error &&
		// 	!this.warn &&
		// 	Object.keys(Flux).includes(this.type) &&
		// 	Object.keys(Flux[this.type]).includes(this.subject)
		// ) {
		// 	return true;
		// } else if (this.warn) {
		// 	log.warn('Flux warn:' + this.warn, this);
		// 	//'Invalid Flux id: ' + id
		// } else {
		// 	Core.error('Flux error:' + this.error, this);
		// }
		// return false;
	};

	this.schedule = () => {
		let i = 0;
		let interval = setInterval(() => {
			this.fire();
			i++;
			if (i == this.loop) {
				clearInterval(interval);
			}
		}, Number(this.delay) * 1000);
	};

	this.fire = () => {
		log[this.log]('> Flux', this.toString());
		Flux[this.type][this.subject].next({
			id: this.id,
			value: this.value
		});
	};

	this.toString = () => {
		let typeSubject = this.type + '|' + this.subject + '|';
		let value = this.id + (this.value ? ' ' + util.format(util.inspect(this.value)) : '') + ' ';
		let delay = ' ' + (this.delay || '');
		let loop = ' ' + (this.loop > 1 ? this.loop : '');
		return typeSubject + value + delay + loop;
	};
}

function next(id, data, conf) {
	if (!ready) {
		log.error('Flux manager not yet ready');
		return;
	}
	if (Array.isArray(id)) {
		id.forEach(flux => {
			next(flux.id, flux.data, flux.conf);
		});
		return;
	}
	if (typeof id === 'object' && id.hasOwnProperty('id')) {
		next(id.id, id.data, id.conf);
		return;
	}

	let flux = new FluxObject(id, data, conf);
	if (!flux.isValid()) return;
	if (flux.delay && Number(flux.delay)) {
		flux.schedule();
		return;
	}
	flux.fire();
}
