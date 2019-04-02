#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(Core._CORE + 'Utils.js');

// const BTN_PUSH_MIN = 0.5;

Core.flux.controller.button.subscribe({
	next: flux => {
		buttonHandler(flux);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function buttonHandler(flux) {
	if (Core.isAwake()) {
		if (flux.id == 'ok') {
			if (Core.run('mood').indexOf('party') > -1) {
				if (Utils.rdm()) {
					Core.do('service|party|tts');
				} else {
					Core.do('service|mood|badBoy');
				}
			} else {
				if (Core.run('voicemail')) {
					Core.do('service|voicemail|check');
				} else if (Core.run('audioRecord')) {
					Core.do('service|audioRecord|check');
				} else {
					Core.do('service|interaction|random');
				}
			}
		} else if (flux.id == 'cancel') {
			if (flux.value < 1) {
				// Mute, do nothing
			} else if (flux.value >= 1 && flux.value < 3) {
				Core.do('service|system|restart');
			} else if (flux.value >= 3 && flux.value < 6) {
				Core.do('service|system|restart', 'sleep');
			} else if (flux.value > 6) {
				Core.do('service|system|restart', 'test');
			} else Core.error('Button->else', flux);
		} else if (flux.id == 'white') {
			Core.do('service|timer|increase', Math.round(flux.value));
		} else if (flux.id == 'blue') {
			// if (flux.value > BTN_PUSH_MIN) {
			if (Core.run('etat')) {
				Core.do('service|music|fip');
			} else {
				Core.do('service|music|jukebox');
			}
			// } else {
			// 	log.info('Blue button must be pushed for ' + BTN_PUSH_MIN + 's at least, try again !');
			// }
		} else Core.error('Button->else', flux);
	} else {
		if (flux.id == 'ok') {
			Core.do('service|system|restart');
		} else if (flux.id == 'white') {
			Core.do('service|system|light', flux.value * 60);
		}
	}
	Core.run('buttonStats.' + flux.id, Core.run('buttonStats.' + flux.id) + 1);
}
