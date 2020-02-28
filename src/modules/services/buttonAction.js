#!/usr/bin/env node
'use strict';

const Core = require('./../../core/Core').Core,
	Observers = require('./../../core/Observers');

const log = new (require('./../../api/Logger'))(__filename),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils');

// const BTN_PUSH_MIN = 0.4;

Observers.controller().button.subscribe({
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
	} else {
		log.error('Unkown button', flux);
		return;
	}
	Core.run('buttonStats.' + flux.id, Core.run('buttonStats.' + flux.id) + 1);
}

function okButtonAction(duration) {
	if (Core.isAwake()) {
		new Flux('interface|rfxcom|send', { device: 'plugA', value: true });
		if (Core.run('voicemail')) {
			new Flux('service|voicemail|check');
		} else if (Core.run('audioRecord')) {
			new Flux('service|audioRecord|check');
		} else if (Core.run('music')) {
			new Flux('service|music|playlist', Core.run('music'));
		} else if (Core.run('mood').indexOf('party') > -1) {
			if (Utils.rdm()) {
				new Flux('service|party|tts');
			} else {
				new Flux('service|mood|badBoy');
			}
		} else {
			new Flux('service|interaction|random');
		}
	} else {
		new Flux('service|context|restart');
	}
}
function cancelButtonAction(duration) {
	new Flux('interface|sound|mute');
	if (duration < 3) {
		new Flux('service|context|restart');
	} else if (duration >= 3 && duration < 6) {
		new Flux('service|context|restart', 'sleep');
	} else if (duration > 6) {
		new Flux('interface|hardware|reboot', null, { delay: 3 });
	} else Core.error('Button->else', flux);
}

function whiteButtonAction(duration) {
	if (Core.isAwake()) {
		new Flux('service|timer|increase', Math.round(duration));
	} else {
		new Flux('interface|hardware|light', duration * 60);
	}
}

function blueButtonAction(duration) {
	if (Core.isAwake()) {
		if (Core.run('etat')) {
			new Flux('service|music|radio', 'fip');
		} else {
			new Flux('service|music|playlist', 'jukebox');
		}
	} else {
		new Flux('service|task|goToSleep');
	}
}

function etatButtonAction(value) {
	Core.run('etat', value ? 'high' : 'low');
	log.info('Etat button value:', Core.run('etat'));
	new Flux('interface|led|toggle', { leds: ['satellite'], value: value }, { log: 'trace' });
	let newVolume = Core.isAwake() ? (value ? 100 : 50) : 0;
	new Flux('interface|sound|volume', newVolume, { log: 'debug' });
	if (Core.run('screen')) {
		new Flux('interface|hdmi|off');
	}
	etatInteraction(value);
}

var instance = false,
	intervalEtat;
const INTERVAL_DELAY = (Core.conf('watcher') ? 60 : 5 * 60) * 1000; //3 * 60 * 1000;
function etatInteraction(value) {
	if (1 === value) {
		if (!instance) {
			instance = true;
			intervalEtat = setInterval(function() {
				log.info('Etat btn Up => random action');
				new Flux('service|interaction|random');
			}, INTERVAL_DELAY);
			new Flux('service|video|loop');
		}
	} else {
		instance = false;
		clearInterval(intervalEtat);
	}
}
