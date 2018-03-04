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

function FluxObject(type, subject, id, value, delay, loop, hidden) {
	this.type = type;
	this.subject = subject;
	this.id = id;
	this.value = value; // || null
	this.delay = delay;
	this.loop = loop;
	this.hidden = hidden || false;

	this.toString = () => {
		var typeSubject = this.type + '|' + this.subject + ' ';
		var value = this.id + (this.value ? ' ' + util.format(util.inspect(this.value)) : '') + ' ';
		var delay = ' ' + (this.delay || '');
		var loop = ' ' + (this.loop || '');
		return typeSubject + value + delay + loop;
	};
}

function list(fluxList) {
	fluxList.forEach(flux => {
		// console.log('--list', flux);
		next(flux.id, flux.data, flux.conf);
	});
}

// "id": "type|subject|id", "data": { "value": null, "delay": null, "loop": null, "hidden": false } }
function next(id, data, conf) {
	if (Array.isArray(id)) {
		console.log('-arrayr... to flux.list', id);
		list(id);
		return;
	}
	id = id.split('|');
	if (!conf) conf = {};
	next2(id[0], id[1], id[2], data, conf.delay, conf.loop, conf.hidden);
}

function next2(type, subject, id, value, delay, loop, hidden) {
	var flux = new FluxObject(type, subject, id, value, delay, loop, hidden);
	// console.log('__________');
	// console.log(flux);
	if (!ready) {
		log.error('Flux manager not yet ready', flux);
		return;
	}
	if (!inspect(flux)) return;
	if (flux.delay && Number(flux.delay)) {
		scheduleFlux(flux);
		return;
	}
	fireFlux(flux);
}

var inspect = flux => {
	if (Object.keys(Flux).includes(flux.type) && Object.keys(Flux[flux.type]).includes(flux.subject)) {
		return true;
	}
	Odi.error('Invalid Flux', flux);
	return false;
};

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
