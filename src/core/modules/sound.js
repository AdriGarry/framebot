#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

var Flux = require(Odi.CORE_PATH + 'Flux.js');
var spawn = require('child_process').spawn;

Flux.module.sound.subscribe({
	next: flux => {
		if (flux.id == 'mute') {
			mute(flux.value.delay, flux.value.message);
		} else if (flux.id == 'volume') {
			// todo setVolume(flux.value);
		} else {
			log.info('Sound flux not mapped', flux);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

var muteTimer, delay;
/** Function to mute Odi (delay:min) */
function mute(delay, message) {
	clearTimeout(muteTimer);
	// log.debug('mute()', 'delay:', delay, 'message:', message);
	delay = delay && !isNaN(delay) ? delay : 0;
	if (delay) {
		muteTimer = setTimeout(function() {
			spawn('sh', [SRC_PATH + 'shell/mute.sh', 'auto']);
			setTimeout(function() {
				stopAll(message);
			}, 1600);
		}, delay * 1000);
	} else {
		stopAll(message);
	}
}

/** Function to stop all sounds & leds */
function stopAll(message) {
	// ODI.tts.clearTTSQueue(); // --> to transform
	// ODI.jukebox.stopFip(); // --> to transform
	log.INFO('stopAll()', message);
	spawn('sh', [SRC_PATH + 'shell/mute.sh']);
	log.info('>> MUTE  -.-', message ? '"' + message + '"' : '');
	Flux.next('module', 'led', 'clearLeds', null, null, null, 'hidden');
	Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly'], value: 0 }, null, null, 'hidden');
}
