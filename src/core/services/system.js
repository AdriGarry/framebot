#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var spawn = require('child_process').spawn;
var fs = require('fs');
var os = require('os');

Flux.service.system.subscribe({
	next: flux => {
		if (flux.id == 'restart') {
			/* || flux.id == 'restartOdi'*/
			restartOdi(flux.value);
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else if (flux.id == 'reboot') {
			reboot();
		} else if (flux.id == 'shutdown') {
			shutdown();
		} else if (flux.id == 'light') {
			light(flux.value);
		} else Odi.error('unmapped flux in System service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function to restart/sleep Odi's core */
function restartOdi(mode) {
	log.info('restarting Odi...', mode || '');
	if (Odi.run('timer')) {
		let timerRemaining = 'Minuterie ' + Odi.run('timer') + 'secondes';
		Flux.next('interface|tts|speak', timerRemaining);
		log.INFO(timerRemaining);
	}
	Flux.next('interface|runtime|updateRestart', { mode: mode || 'ready' });
}

/** Function to random TTS good night, and sleep */
function goToSleep() {
	if (Odi.isAwake()) {
		let sleepTTS = Utils.randomItem(Odi.ttsMessages.goToSleep);
		Flux.next('interface|tts|speak', sleepTTS);
		log.info('AutoLifeCycle go to sleep !');
		setTimeout(function() {
			Flux.next('service|system|restart', 'sleep');
		}, sleepTTS.msg.length * 150);
	}
}

/** Function to reboot RPI */
function reboot() {
	if (Odi.isAwake()) {
		Flux.next('interface|sound|mute');
		Flux.next('interface|tts|speak', { msg: 'Je redaimarre' });
		Flux.next('interface|arduino|write', 'playHornOff', { delay: 2 });
	}
	console.log('\n\n_/!\\__REBOOTING RASPBERRY PI !!\n');
	setTimeout(function() {
		spawn('reboot');
	}, 2000);
}

/** Function to shutdown RPI */
function shutdown() {
	if (Odi.isAwake()) {
		Flux.next('interface|sound|mute');
		Flux.next('interface|tts|speak', { msg: 'Arret system' });
		Flux.next('interface|arduino|write', 'playHornOff', { delay: 2 });
	}
	setTimeout(function() {
		console.log("\n\n /!\\  SHUTING DOWN RASPBERRY PI - DON'T FORGET TO SWITCH OFF POWER SUPPLY !!\n");
		spawn('halt');
	}, 2000);
}

/** Function to use belly led as light */
function light(duration) {
	log.info('light [duration=' + duration + 's]');
	if (isNaN(duration)) Odi.error('light error: duration arg is not a number!', duration, false);
	let loop = (duration - 2) / 2;
	Flux.next('interface|led|toggle', { leds: ['belly'], value: 1 });
	Flux.next('interface|led|toggle', { leds: ['belly'], value: 1 }, { hidden: true, delay: 2, loop: loop });

	Flux.next('interface|led|blink', { leds: ['belly'], speed: 200, loop: 8 }, { delay: duration - 2 });

	Flux.next('interface|led|toggle', { leds: ['belly'], value: 0 }, { delay: duration });
}
