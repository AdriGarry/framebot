#!/usr/bin/env node
"use strict";

var Odi = require(ODI_PATH + "core/Odi.js").Odi;
var log = new (require(Odi.CORE_PATH + "Logger.js"))(__filename.match(/(\w*).js/g)[0]);

const Rx = require("rxjs");
var Flux = {
	controller: {
		button: new Rx.Subject(), //require(Odi.CORE_PATH + "controllers/button.js"),
		jobs: new Rx.Subject(), // require(Odi.CORE_PATH + "controllers/jobs.js"),
		server: new Rx.Subject() // require(Odi.CORE_PATH + "controllers/server.js")
	},
	module: {
		hardware: new Rx.Subject(),
		led: new Rx.Subject(),
		sound: new Rx.Subject()
	},
	service: {
		mood: new Rx.Subject(), // random, exclamation, badBoy, party, [cigales ?]
		music: new Rx.Subject(), // fip, jukebox
		time: new Rx.Subject(),
		tools: new Rx.Subject(), // ??
		tts: new Rx.Subject(), // +voicemail ?
		system: new Rx.Subject(),
		util: new Rx.Subject(),
		video: new Rx.Subject()
	}
};

module.exports = {
	controller: Flux.controller,
	module: Flux.module,
	next: next,
	service: Flux.service
};

function FluxObject(type, name, id, value, delay, loop) {
	this.type = type;
	this.name = name;
	this.id = id;
	this.value = value;// || null
	this.delay = delay;
	this.loop = loop;

	this.toString = () => {
		var typeName = '[' + this.type + '.' + this.name + '] ';
		var value = this.id + ': ' + this.value + ' ';
		var delay = this.delay || ' .';
		var loop = this.loop || ' .';
		// var delay = this.delay ? (' ' + this.delay) : '.';
		// var loop = this.loop ? (' ' + this.loop) : '.';
		return typeName + value + delay + loop;
	}
};

function next(type, name, id, value, delay, loop) {
	// var flux = { type: type, name: name, id: id, value: value, delay: delay, loop: loop };
	var flux = new FluxObject(type, name, id, value, delay, loop);

	if (!inspect(flux)) return;
	// log.INFO(flux);
	if (flux.delay && Number(flux.delay)) {
		scheduleFlux(flux);
		return;
	}
	fireFlux(flux);
};

var inspect = (flux) => {
	// log.debug('inspecting Flux: type=' + flux.type + ', name=' + flux.name + ', id=' + flux.id + ', value=' + flux.value + ', delay=' + flux.delay + ', loop=' + flux.loop);
	log.debug('inspecting Flux:', flux.toString());
	if (Object.keys(Flux).includes(flux.type) && Object.keys(Flux[flux.type]).includes(flux.name)) {
		return true;
	}
	Odi.error('Invalid Flux', flux);
	return false;
};

var scheduleFlux = (flux) => {
	var i = 0;
	var totalLoop = flux.loop && Number(flux.loop) ? flux.loop : 1;

	var interval = setInterval(() => {
		fireFlux(flux);
		i++;
		// log.INFO('i', i);
		// log.INFO('totalLoop', totalLoop);
		if (totalLoop == i) {
			// log.debug('cancelling flux loop', flux);
			clearInterval(interval);
		}
	}, Number(flux.delay) * 1000);
};

var fireFlux = (flux) => {
	log.info('=> Flux', flux.toString());
	Flux[flux.type][flux.name].next({ id: flux.id, value: flux.value });
};

var buttonHandler = flux => {
	log.info("buttonHandler", flux);
	// actions to define here...
	// utiliser des switch/case (voir si possible avec plusieurs params)
};

// A déplacer dans un nouveau fichier brain.js ?
/*Flux.controller.button.subscribe({
	next: flux => {
		// if (!inspect(flux, { type: "controller", id: "jobs" })) return;
		if (flux.id == "ok") {
			Flux.service.time.next({ id: "bip", value: "ok" });
		} else if (flux.id == "cancel") {
			Flux.module.sound.next({ id: "bip", value: "cancel" });
		} else if (flux.id == "blue") {
			Odi.error(flux);
		} else {
			log.info("Button[else]", flux);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

// Flux.controller.jobs = require(Odi.CORE_PATH + "controllers/jobs.js");
Flux.controller.jobs.subscribe({
	next: (flux, flux2) => {
		// if (!inspect(flux, { type: "controller", id: "jobs" })) return;
		if (flux.id == "clock") {
			Flux.service.time.next({ id: "now", value: null });
		} else if (flux.id == "sound") {
			Flux.module.led.next({
				id: "blink", value: { leds: ["nose"], speed: 100, loop: 1 }
			});
		} else {
			log.info("Jobs[else]", flux);
		}
	},
	error: err => {
		Odi.error(err);
	}
});*/

log.info("Flux manager ready");
