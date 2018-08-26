#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
const Utils = require(Core._CORE + 'Utils.js');
const Flux = require(Core._CORE + 'Flux.js');
// const BTN_PUSH_MIN = 0.5;

Flux.controller.button.subscribe({
	next: flux => {
		buttonHandler(flux);
	},
	error: err => {
		Core.error(flux);
	}
});

function buttonHandler(flux) {
	if (Core.isAwake()) {
		if (flux.id == 'ok') {
			if (Core.run('mood').indexOf('party') > -1) {
				if (Utils.rdm()) {
					Flux.next('service|party|tts');
				} else {
					Flux.next('service|mood|badBoy');
				}
			} else {
				if (Core.run('voicemail')) {
					Flux.next('service|voicemail|check');
				} else {
					Flux.next('service|interaction|random');
				}
			}
		} else if (flux.id == 'cancel') {
			if (flux.value < 1) {
				// Mute, do nothing
			} else if (flux.value >= 1 && flux.value < 3) {
				Flux.next('service|system|restart');
			} else if (flux.value >= 3 && flux.value < 6) {
				Flux.next('service|system|restart', 'sleep');
			} else if (flux.value > 6) {
				Flux.next('service|system|restart', 'test');
			} else Core.error('Button->else', flux);
		} else if (flux.id == 'white') {
			Flux.next('service|time|timer', Math.round(flux.value));
		} else if (flux.id == 'blue') {
			// if (flux.value > BTN_PUSH_MIN) {
			if (Core.run('etat')) {
				Flux.next('service|music|fip');
			} else {
				Flux.next('service|music|jukebox');
			}
			// } else {
			// 	log.info('Blue button must be pushed for ' + BTN_PUSH_MIN + 's at least, try again !');
			// }
		} else Core.error('Button->else', flux);
	} else {
		if (flux.id == 'ok') {
			Flux.next('service|system|restart');
		} else if (flux.id == 'white') {
			Flux.next('service|system|light', flux.value * 60);
		}
	}
	Core.run('buttonStats.' + flux.id, Core.run('buttonStats.' + flux.id) + 1);
}
