#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

var util = require('util');
const Rx = require('rxjs');

var Flux = {
	controller: {
		button: new Rx.Subject(),
		jobs: new Rx.Subject(),
		server: new Rx.Subject()
	},
	module: {
		conf: new Rx.Subject(),
		hardware: new Rx.Subject(),
		led: new Rx.Subject(),
		sound: new Rx.Subject(),
		tts: new Rx.Subject() // +voicemail ?
	},
	service: {
		interaction: new Rx.Subject(), // exclamation, weather...
		max: new Rx.Subject(), // Max & Co...
		mood: new Rx.Subject(), // badBoy, party, [cigales ?]
		party: new Rx.Subject(), // badBoy, party, [cigales ?]
		music: new Rx.Subject(), // fip, jukebox
		time: new Rx.Subject(),
		tools: new Rx.Subject(), // ??
		system: new Rx.Subject(),
		util: new Rx.Subject(),
		video: new Rx.Subject(),
		voicemail: new Rx.Subject()
	}
};

module.exports = {
	controller: Flux.controller,
	module: Flux.module,
	next: next,
	service: Flux.service
};

function FluxObject(type, subject, id, value, delay, loop, hidden) {
	this.type = type;
	this.subject = subject;
	this.id = id;
	this.value = value; // || null
	this.delay = delay;
	this.loop = loop;
	this.hidden = hidden || false;

	this.toString = () => {
		// var typeSubject = '[' + this.type + '.' + this.subject + '] ';
		var typeSubject = this.type + '|' + this.subject + ' ';
		var value = this.id + (this.value ? ' ' + util.format(util.inspect(this.value)) : '') + ' ';
		var delay = ' ' + (this.delay || '');
		var loop = ' ' + (this.loop || '');
		return typeSubject + value + delay + loop;
	};
}

function next(type, subject, id, value, delay, loop, hidden) {
	var flux = new FluxObject(type, subject, id, value, delay, loop, hidden);

	if (!inspect(flux)) return;
	if (flux.delay && Number(flux.delay)) {
		scheduleFlux(flux);
		return;
	}
	fireFlux(flux);
}

var inspect = flux => {
	//log.debug('inspecting Flux:', flux.toString());
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
	if (!flux.hidden || Odi.conf.debug) log.info('> Flux', flux.toString());
	Flux[flux.type][flux.subject].next({ id: flux.id, value: flux.value });
};

log.info('Flux manager ready');
