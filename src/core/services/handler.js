#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Odi._CORE + 'Utils.js');

var Flux = require(Odi._CORE + 'Flux.js');

Flux.controller.button.subscribe({
	next: flux => {
		buttonHandler(flux);
	},
	error: err => {
		Odi.error(flux);
	}
});

Flux.controller.jobs.subscribe({
	next: flux => {
		jobsHandler(flux);
	},
	error: err => {
		Odi.error(err);
	}
});

function buttonHandler(flux) {
	if (Odi.isAwake()) {
		if (flux.id == 'ok') {
			if (Odi.run('mood').indexOf('party') > -1) {
				if (Utils.random()) {
					Flux.next('service', 'party', 'tts');
				} else {
					Flux.next('service', 'mood', 'badBoy');
				}
			} else {
				if (Odi.run('voicemail')) {
					Flux.next('service', 'voicemail', 'check');
				} else {
					Flux.next('service', 'interaction', 'random');
				}
			}
		} else if (flux.id == 'cancel') {
			if (flux.value < 1) {
				// Mute, do nothing
			} else if (flux.value >= 1 && flux.value < 3) {
				Flux.next('service', 'system', 'restart', null);
			} else if (flux.value >= 3 && flux.value < 6) {
				Flux.next('service', 'system', 'restart', 'sleep');
			} else if (flux.value > 6) {
				Flux.next('service', 'system', 'restart', 'test');
			} else Odi.error('Button->else', flux);
		} else if (flux.id == 'white') {
			Flux.next('service', 'time', 'timer', Math.round(flux.value));
		} else if (flux.id == 'blue') {
			//log.INFO('to fix!!!!!');
			if (flux.value > 0.8) {
				if (Odi.run('etat')) {
					Flux.next('service', 'music', 'fip'); // TODO
				} else {
					Flux.next('service', 'music', 'jukebox'); // TODO
				}
			} else {
				log.info('Blue button must be pushed for .8s at least, try again !');
			}
		} else Odi.error('Button->else', flux);
	} else {
		if (flux.id == 'ok') {
			Flux.next('service', 'system', 'restart', null);
		}
	}
}

// setTimeout(() => {
// 	log.INFO('---> TEST !!');
// }, 3000);
