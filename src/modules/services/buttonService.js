#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(Core._CORE + 'Utils.js');

// const BTN_PUSH_MIN = 0.4;

Core.flux.controller.button.subscribe({
	next: flux => {
		buttonHandler(flux);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function buttonHandler(flux) {
	if (flux.id == 'ok') {
		okButtonAction(flux.value);
	} else if (flux.id == 'cancel') {
		cancelButtonAction(flux.value);
	} else if (flux.id == 'white') {
		whiteButtonAction(flux.value);
	} else if (flux.id == 'blue') {
		blueButtonAction(flux.value);
	} else if (flux.id == 'etat') {
		etatButtonAction(flux.value);
	} else Core.error('Button->else', flux);
	Core.run('buttonStats.' + flux.id, Core.run('buttonStats.' + flux.id) + 1);
}

function okButtonAction(duration) {
	if (Core.isAwake()) {
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
	} else {
		Core.do('service|context|restart');
	}
}
function cancelButtonAction(duration) {
	Core.do('interface|sound|mute');
	if (flux.value < 1) {
		// Mute, do nothing
	} else if (flux.value >= 1 && flux.value < 3) {
		Core.do('service|context|restart');
	} else if (flux.value >= 3 && flux.value < 6) {
		Core.do('service|context|restart', 'sleep');
	} else if (flux.value > 6) {
		Core.do('service|context|restart', 'test');
	} else Core.error('Button->else', flux);
}

function whiteButtonAction(duration) {
	if (Core.isAwake()) {
		Core.do('service|timer|increase', Math.round(flux.value));
	} else {
		Core.do('service|system|light', flux.value * 60);
	}
}

function blueButtonAction(duration) {
	if (Core.run('etat')) {
		Core.do('service|music|fip');
	} else {
		Core.do('service|music|jukebox');
	}
}

function etatButtonAction(value) {
	log.warn('etatButtonAction, value=', value);
	Core.run('etat', value ? 'high' : 'low');
	log.info('Etat has changed:', Core.run('etat'));
	let newVolume = Core.isAwake() ? (value ? 100 : 50) : 0;
	Core.do('interface|sound|volume', newVolume);
	if (Core.run('screen')) {
		Core.do('interface|hdmi|off');
	}
	setTimeout(() => {
		log.table(Core.run(), 'RUNTIME');
	}, 200);
}
