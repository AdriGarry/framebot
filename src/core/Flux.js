#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(ODI_PATH + 'src/core/Utils.js');

var util = require('util');
const Rx = require('rxjs');

var ready = false;
var Flux = {
	attach: attachObservers,
	loadModules: loadModules,
	next: next,
	list: list
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
			require(Odi._CORE + module + '/' + modules[module].base[i] + '.js');
		}
		modulesLoaded += modules[module].base.join(', ');
		if (Odi.isAwake() && modules[module].hasOwnProperty('full')) {
			for (let i = 0; i < modules[module].full.length; i++) {
				require(Odi._CORE + module + '/' + modules[module].full[i] + '.js');
			}
			modulesLoaded += ', ' + modules[module].full.join(', ');
		}
		log.info(module, 'loaded:', modulesLoaded); //, '[' + Utils.executionTime(startTime) + 'ms]');
	});
	return Flux;
}

const FLUX_REGEX = new RegExp(/\w+\|\w+\|\w+/);

function FluxObject(id, data, conf) {
	if (!FLUX_REGEX.test(id)) {
		this.error = 'Invalid Flux id: ' + id;
	}
	id = id.split('|');
	if (!conf) conf = {};

	this.type = id[0];
	this.subject = id[1];
	this.id = id[2];
	this.value = data; // || null
	this.delay = conf.delay;
	this.loop = conf.loop;
	this.hidden = conf.hidden || false;

	this.toString = () => {
		var typeSubject = this.type + '|' + this.subject + '|';
		var value = this.id + (this.value ? ' ' + util.format(util.inspect(this.value)) : '') + ' ';
		var delay = ' ' + (this.delay || '');
		var loop = ' ' + (this.loop || '');
		return typeSubject + value + delay + loop;
	};

	this.isValid = () => {
		if (!this.error && Object.keys(Flux).includes(this.type) && Object.keys(Flux[this.type]).includes(this.subject)) {
			return true;
		}
		Odi.error(this.error || 'Invalid Flux', this, false);
		return false;
	};
}

function list(fluxList) {
	fluxList.forEach(flux => {
		next(flux.id, flux.data, flux.conf);
	});
}

function next(id, data, conf) {
	if (!ready) {
		log.error('Flux manager not yet ready');
		return;
	}
	if (Array.isArray(id)) {
		list(id);
		return;
	}
	if (typeof id === 'object' && id.hasOwnProperty('id')) {
		next(id.id, id.data, id.conf);
		return;
	}

	let flux = new FluxObject(id, data, conf);
	if (!flux.isValid()) return;
	if (flux.delay && Number(flux.delay)) {
		scheduleFlux(flux);
		return;
	}
	fireFlux(flux);
}

var scheduleFlux = flux => {
	var i = 0;
	var totalLoop = flux.loop && Number(flux.loop) ? flux.loop : 1;
	var interval = setInterval(() => {
		fireFlux(flux);
		i++;
		if (totalLoop == i) {
			clearInterval(interval);
		}
	}, Number(flux.delay) * 1000);
};

var fireFlux = flux => {
	if (!flux.hidden || (Odi && Odi.conf('debug'))) log.info(/*Utils.stackPosition() + */ '> Flux', flux.toString());
	Flux[flux.type][flux.subject].next({ id: flux.id, value: flux.value });
};

module.exports = Flux;
