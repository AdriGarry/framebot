#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);

// const Rx = require('rxjs');

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
	if (Odi.conf.mode != 'sleep') {
		if (flux.id == 'ok') {
			console.log('Odi.run.mood.indexOf(party) > 1', Odi.run.mood.indexOf('party') > 0);
			if (Odi.run.mood.indexOf('party') > 0) {
				Flux.next('service', 'party', 'tts');
			} else {
				if (Odi.run.voicemail) {
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
			log.INFO('to fix!!!!!');
			if (flux.value > 0.8) {
				if (Odi.run.etat) {
					Flux.next('service', 'music', 'fip'); // TODO
				} else {
					Flux.next('service', 'music', 'jukebox'); // TODO
				}
			}
			// Flux.next('service', 'music', 'fip'); // TODO
			// Flux.next('service', 'music', 'jukebox'); // TODO
		} else Odi.error('Button->else', flux);
	} else {
		if (flux.id == 'ok') {
			Flux.next('service', 'system', 'restart', null);
		}
	}
}

log.info('Brain ready'); //loaded/compiled
