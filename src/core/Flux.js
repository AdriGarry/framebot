#!/usr/bin/env node

'use strict';

const util = require('util'),
	Rx = require('rxjs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]);

var ready = false;
var Flux = {
	attach: attachObservers,
	loadModules: loadModules,
	next: next
};

function attachObservers(observers) {
	log.debug('attaching observers...');
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
	Object.keys(modules).forEach(function(module) {
		let modulesLoaded = '';
		for (let i = 0; i < modules[module].base.length; i++) {
			require(Core._CORE + module + '/' + modules[module].base[i] + '.js');
		}
		modulesLoaded += modules[module].base.join(', ');
		if (Core.isAwake() && modules[module].hasOwnProperty('full')) {
			for (let i = 0; i < modules[module].full.length; i++) {
				require(Core._CORE + module + '/' + modules[module].full[i] + '.js');
			}
			modulesLoaded += ', ' + modules[module].full.join(', ');
		}
		log.info(module, 'loaded:', modulesLoaded); //, '[' + Utils.executionTime(startTime) + 'ms]');
	});
	return Flux;
}

const FLUX_REGEX = new RegExp(/\w+\|\w+\|\w+/); // TODO

function FluxObject(id, data, conf) {
	try {
		id = id.split('|');
		if (!conf) conf = {};
		this.type = id[0] || '';
		this.subject = id[1] || '';
		this.id = id[2] || '';
	} catch (err) {
		this.error = 'Invalid Flux id: ' + id;
	}
	this.value = data;
	this.delay = Number(conf.delay) || 0;
	this.loop = Number(conf.loop) || 1;
	this.hidden = conf.hidden || false;

	this.toString = () => {
		let typeSubject = this.type + '|' + this.subject + '|';
		let value = this.id + (this.value ? ' ' + util.format(util.inspect(this.value)) : '') + ' ';
		let delay = ' ' + (this.delay || '');
		let loop = ' ' + (this.loop > 1 ? this.loop : '');
		return typeSubject + value + delay + loop;
	};

	this.isValid = () => {
		if (!this.error && Object.keys(Flux).includes(this.type) && Object.keys(Flux[this.type]).includes(this.subject)) {
			return true;
		}
		Core.error(this.error || 'Invalid Flux', this);
		return false;
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
		if (this.hidden) log.trace(/*Utils.filePosition(3) + */ '> Flux', this.toString());
		else log.info(/*Utils.filePosition() + */ '> Flux', this.toString());
		Flux[this.type][this.subject].next({
			id: this.id,
			value: this.value
		});
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

module.exports = Flux;
