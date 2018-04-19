#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename);
const Flux = require(Odi._CORE + 'Flux.js');
const Utils = require(Odi._CORE + 'Utils.js');
const spawn = require('child_process').spawn;

Flux.interface.video.subscribe({
	next: flux => {
		if (flux.id == 'screenOn') {
			screenOn();
		} else if (flux.id == 'screenOff') {
			screenOff();
		} else if (flux.id == 'cycle') {
			startCycle();
		} else if (flux.id == 'logTail') {
			logTail();
		} else Odi.error('unmapped flux in Video interface', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

setImmediate(() => {
	if (Odi.run('etat') == 'high') {
		startCycle();
	} else {
		screenOff();
	}
});

function logTail() {
	log.info('screen on + log tail to implement!');
}

/** Function to turn screen on (for 30 minutes) */
function screenOn() {
	spawn('/opt/vc/bin/tvservice', ['-p']);
	log.info('Screen on');
	Odi.run('screen', true);
	setTimeout(function() {
		screenOff();
	}, 30 * 60 * 1000);
}

/** Function to turn screen off */
function screenOff() {
	spawn('/opt/vc/bin/tvservice', ['-o']);
	Odi.run('etat', false);
	log.info('screen off');
}

/** Function to launch a video cycle for 30 minutes */
function startCycle() {
	screenOn();
	//https://www.npmjs.com/package/raspberrypi
	spawn('sh', [Odi._SHELL + 'diapo.sh']);
	log.info('Video cycle for 30 minutes');
	setTimeout(function() {
		screenOff();
	}, 30 * 60 * 1000);
}
