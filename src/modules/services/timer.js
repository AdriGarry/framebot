#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core;

const { Flux, Logger, Observers, Scheduler } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
	{ id: 'increase', fn: setTimer },
	{ id: 'stop', fn: stopTimer }
];

Observers.attachFluxParseOptions('service', 'timer', FLUX_PARSE_OPTIONS);

function setTimer(minutes) {
	if (typeof minutes === 'number' && Number(minutes) > 1) {
		minutes = 60 * Number(minutes);
	} else {
		minutes = 60;
	}
	Scheduler.stopDecrement('timer');
	Scheduler.decrement('timer', minutes, endTimerTimeout, 1, decrementTimerTimeout);
	Core.run('timer', Core.run('timer') + minutes);
	let min = Math.floor(Core.run('timer') / 60);
	let sec = Core.run('timer') % 60;
	let ttsMsg =
		'Minuterie ' + (min > 0 ? (min > 1 ? min : ' une ') + ' minutes ' : '') + (sec > 0 ? sec + ' secondes' : '');
	new Flux('interface|tts|speak', {
		lg: 'fr',
		msg: ttsMsg
	});
}

function decrementTimerTimeout() {
	toggleBellyLed();
	if (Core.run('timer') < 10) {
		new Flux(
			'interface|sound|play',
			{ mp3: 'system/timerAlmostEnd.mp3', noLog: true, noLed: true },
			{ log: 'trace' }
		);
	} else {
		new Flux('interface|sound|play', { mp3: 'system/timer.mp3', noLog: true, noLed: true }, { log: 'trace' });
	}
	Core.run('timer', Core.run('timer') - 1);
	if (Core.run('timer') % 120 == 0 && Core.run('timer') / 60 > 0) {
		new Flux('interface|tts|speak', Core.run('timer') / 60 + ' minutes et compte a rebours');
	}
}

let ledState = 1;

function toggleBellyLed(){
	new Flux('interface|led|toggle', { leds: ['belly'], value: ledState }, { log: 'trace' });
	ledState = 1 - ledState;
}

function endTimerTimeout(){
	log.info('End Timer !');
	Core.run('timer', 0);
	new Flux('interface|sound|play', { mp3: 'system/timerEnd.mp3', noLog: true });
	new Flux('interface|led|blink', { leds: ['belly', 'eye'], speed: 90, loop: 12 });
	new Flux('interface|tts|speak', 'Les raviolis sont cuits !');
	new Flux('interface|led|toggle', { leds: ['belly'], value: 0 }, { delay: 1 });
}

function stopTimer() {
	Core.run('timer', 0);
	Scheduler.stopDecrement('timer');
	new Flux('interface|tts|speak', { lg: 'en', msg: 'Timer canceled' });
	new Flux('interface|led|toggle', { leds: ['belly'], value: 0 }, { log: 'trace' });
}
