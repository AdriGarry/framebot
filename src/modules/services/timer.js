#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core,
	Observers = require('./../../core/Observers');

const log = new (require('./../../api/Logger'))(__filename),
	Flux = require('./../../api/Flux');

Observers.service().timer.subscribe({
	next: flux => {
		if (flux.id == 'increase') {
			setTimer(flux.value);
		} else if (flux.id == 'stop') {
			stopTimer();
		} else Core.error('unmapped flux in Timer service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

var secInterval;

function setTimer(minutes) {
	if (typeof minutes === 'number' && Number(minutes) > 1) {
		minutes = 60 * Number(minutes);
	} else {
		minutes = 60;
	}
	Core.run('timer', Core.run('timer') + minutes);
	if (!secInterval) {
		startTimer();
	}
	let min = Math.floor(Core.run('timer') / 60);
	let sec = Core.run('timer') % 60;
	let ttsMsg =
		'Minuterie ' + (min > 0 ? (min > 1 ? min : ' une ') + ' minutes ' : '') + (sec > 0 ? sec + ' secondes' : '');
	new Flux('interface|tts|speak', {
		lg: 'fr',
		msg: ttsMsg
	});
}

function startTimer() {
	let etat = 1;
	secInterval = setInterval(function() {
		new Flux('interface|led|toggle', { leds: ['belly'], value: etat }, { log: 'trace' });
		etat = 1 - etat;
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
		} else if (Core.run('timer') <= 0 && Core.run('timer') > -5) {
			clearInterval(secInterval);
			log.info('End Timer !');
			new Flux('interface|sound|play', { mp3: 'system/timerEnd.mp3', noLog: true });
			new Flux('interface|led|blink', { leds: ['belly', 'eye'], speed: 90, loop: 12 });
			new Flux('interface|tts|speak', 'Les raviolis sont cuits !');
			new Flux('interface|led|toggle', { leds: ['belly'], value: 0 }, { delay: 1 });
		}
	}, 1000);
}

function stopTimer() {
	if (Core.run('timer') > 0) {
		clearInterval(secInterval);
		secInterval = false;
		Core.run('timer', 0);
		new Flux('interface|tts|speak', { lg: 'en', msg: 'Timer canceled' });
		new Flux('interface|led|toggle', { leds: ['belly'], value: 0 }, { log: 'trace' });
	}
}
