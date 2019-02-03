#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

Core.flux.interface.hdmi.subscribe({
	next: flux => {
		if (flux.id == 'on') {
			screenOn();
		} else if (flux.id == 'off') {
			screenOff();
		} else Core.error('unmapped flux in Hdmi interface', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	if (!Core.isAwake()) {
		screenOff();
	}
});

/** Function to turn screen on (for 30 minutes) */
function screenOn() {
	spawn('/opt/vc/bin/tvservice', ['-p']);
	log.info('Screen on');
	Core.run('hdmi', true);
	setTimeout(function() {
		screenOff();
	}, 30 * 60 * 1000);
}

/** Function to turn screen off */
function screenOff() {
	spawn('/opt/vc/bin/tvservice', ['-o']);
	Core.do('service|video|stopLoop');
	Core.run('hdmi', false);
	log.info('screen off');
}

/** Function to launch a video cycle for 30 minutes */
function startCycle() {
	// screenOn();
	// //https://www.npmjs.com/package/raspberrypi
	// spawn('sh', [Core._SHELL + 'diapo.sh']);
	// log.info('Video cycle for 30 minutes');
	// setTimeout(function() {
	// 	screenOff();
	// }, 30 * 60 * 1000);
}
