#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const Flux = require(Core._CORE + 'Flux.js');
const Utils = require(_PATH + 'src/core/Utils.js');
const spawn = require('child_process').spawn;
const fs = require('fs');
const os = require('os');

Flux.service.system.subscribe({
	next: flux => {
		if (flux.id == 'restart') {
			/* || flux.id == 'restartCore'*/
			restartCore(flux.value);
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else if (flux.id == 'reboot') {
			reboot();
		} else if (flux.id == 'shutdown') {
			shutdown();
		} else if (flux.id == 'light') {
			light(flux.value);
		} else Core.error('unmapped flux in System service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

/** Function to restart/sleep Core */
function restartCore(mode) {
	log.info('restarting Core...', mode || '');
	if (Core.run('timer')) {
		let timerRemaining = 'Minuterie ' + Core.run('timer') + 'secondes';
		Flux.next('interface|tts|speak', timerRemaining);
		log.INFO(timerRemaining);
	}
	// log.
	Flux.next('interface|runtime|updateRestart', { mode: mode || 'ready' });
}

/** Function to random TTS good night, and sleep */
function goToSleep() {
	if (Core.isAwake()) {
		let sleepTTS = Utils.randomItem(Core.ttsMessages.goToSleep);
		Flux.next('interface|tts|speak', sleepTTS);
		log.info('AutoLifeCycle go to sleep !');
		setTimeout(function() {
			Flux.next('service|system|restart', 'sleep');
		}, sleepTTS.msg.length * 150);
	}
}

/** Function to reboot RPI */
function reboot() {
	if (Core.isAwake()) {
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
	if (Core.isAwake()) {
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
	if (isNaN(duration)) Core.error('light error: duration arg is not a number!', duration, false);
	let loop = (duration - 2) / 2;
	Flux.next('interface|led|toggle', { leds: ['belly'], value: 1 });
	Flux.next('interface|led|toggle', { leds: ['belly'], value: 1 }, { hidden: true, delay: 2, loop: loop });

	Flux.next('interface|led|blink', { leds: ['belly'], speed: 200, loop: 8 }, { delay: duration - 2 });

	Flux.next('interface|led|toggle', { leds: ['belly'], value: 0 }, { delay: duration });
}
