#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

Core.flux.interface.video.subscribe({
	next: flux => {
		if (flux.id == 'screenOn') {
			screenOn();
		} else if (flux.id == 'screenOff') {
			screenOff();
		} else if (flux.id == 'cycle') {
			startCycle();
		} else if (flux.id == 'logTail') {
			logTail();
		} else Core.error('unmapped flux in Video interface', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

setImmediate(() => {
	if (!Core.isAwake()) {
		screenOff();
	} else if (Core.run('etat') == 'high') {
		startCycle();
	}
});

function logTail() {
	log.info('screen on + log tail to implement!');
}

/** Function to turn screen on (for 30 minutes) */
function screenOn() {
	spawn('/opt/vc/bin/tvservice', ['-p']);
	log.info('Screen on');
	Core.run('screen', true);
	setTimeout(function() {
		screenOff();
	}, 30 * 60 * 1000);
}

/** Function to turn screen off */
function screenOff() {
	spawn('/opt/vc/bin/tvservice', ['-o']);
	Core.run('screen', false);
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
