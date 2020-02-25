#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(Core._API + 'Utils.js');

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
	} else {
		log.error('Unkown button', flux);
		return;
	}
	Core.run('buttonStats.' + flux.id, Core.run('buttonStats.' + flux.id) + 1);
}

function okButtonAction(duration) {
	if (Core.isAwake()) {
		Core.do('interface|rfxcom|send', { device: 'plugA', value: true });
		if (Core.run('voicemail')) {
			Core.do('service|voicemail|check');
		} else if (Core.run('audioRecord')) {
			Core.do('service|audioRecord|check');
		} else if (Core.run('music')) {
			Core.do('service|music|playlist', Core.run('music'));
		} else if (Core.run('mood').indexOf('party') > -1) {
			if (Utils.rdm()) {
				Core.do('service|party|tts');
			} else {
				Core.do('service|mood|badBoy');
			}
		} else {
			Core.do('service|interaction|random');
		}
	} else {
		Core.do('service|context|restart');
	}
}
function cancelButtonAction(duration) {
	Core.do('interface|sound|mute');
	if (duration < 3) {
		Core.do('service|context|restart');
	} else if (duration >= 3 && duration < 6) {
		Core.do('service|context|restart', 'sleep');
	} else if (duration > 6) {
		Core.do('interface|hardware|reboot', null, { delay: 3 });
	} else Core.error('Button->else', flux);
}

function whiteButtonAction(duration) {
	if (Core.isAwake()) {
		Core.do('service|timer|increase', Math.round(duration));
	} else {
		Core.do('interface|hardware|light', duration * 60);
	}
}

function blueButtonAction(duration) {
	if (Core.isAwake()) {
		if (Core.run('etat')) {
			Core.do('service|music|radio', 'fip');
		} else {
			Core.do('service|music|playlist', 'jukebox');
		}
	} else {
		Core.do('service|task|goToSleep');
	}
}

function etatButtonAction(value) {
	Core.run('etat', value ? 'high' : 'low');
	log.info('Etat button value:', Core.run('etat'));
	Core.do('interface|led|toggle', { leds: ['satellite'], value: value }, { log: 'trace' });
	let newVolume = Core.isAwake() ? (value ? 100 : 50) : 0;
	Core.do('interface|sound|volume', newVolume, { log: 'debug' });
	if (Core.run('screen')) {
		Core.do('interface|hdmi|off');
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
				Core.do('service|interaction|random');
			}, INTERVAL_DELAY);
			Core.do('service|video|loop');
		}
	} else {
		instance = false;
		clearInterval(intervalEtat);
	}
}
