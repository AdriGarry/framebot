#!/usr/bin/env node
"use strict";

var Odi = require(ODI_PATH + "src/core/Odi.js").Odi;
var log = new (require(Odi.CORE_PATH + "Logger.js"))(__filename.match(/(\w*).js/g)[0]);

const Rx = require("rxjs");

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.controller.button.subscribe({
	next: flux => {
		log.INFO(flux);
		if (flux.id == "ok") {
			Flux.service.time.next({ id: "bip", value: "ok" });
		} else if (flux.id == "cancel") {
			if (flux.value > 1) {
				process.exit();
			} else {
				Flux.module.sound.next({ id: "bip", value: "cancel" });
			}
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
});

log.info("Brain loaded");
