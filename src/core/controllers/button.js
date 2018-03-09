#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(Odi._CORE + 'Utils.js');

var Gpio = require('onoff').Gpio;
var belly = new Gpio(17, 'out');
// belly.write(1);
// TODO => créer une boucle pour les construire dynamiquement !
var ok = new Gpio(20, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var cancel = new Gpio(16, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var white = new Gpio(19, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var blue = new Gpio(26, 'in', 'rising', { persistentWatch: true, debounceTimeout: 1000 });
var etat = new Gpio(13, 'in', 'both', { persistentWatch: true, debounceTimeout: 500 });
ok.name = 'Ok';
cancel.name = 'Cancel';
white.name = 'White';
blue.name = 'Blue';

var Flux = require(Odi._CORE + 'Flux.js');

const DEBOUNCE_LIMIT = 0.1;
// if(Odi.conf('mode') == 'sleep') initButtonSleep();
// else initButtonReady();
initButtonReady();

function initButtonReady() {
	ok.watch(function(err, value) {
		var pushTime = getPushTime(ok);
		//oneMorePush();
		Flux.next('controller|button|ok', pushTime);
	});

	cancel.watch(function(err, value) {
		Flux.next('interface|sound|mute');
		var pushTime = getPushTime(cancel);
		Flux.next('controller|button|cancel', pushTime);
	});

	white.watch(function(err, value) {
		var pushTime = getPushTime(white);
		Flux.next('controller|button|white', pushTime);
	});

	blue.watch(function(err, value) {
		var pushTime = getPushTime(blue);
		if (pushTime > DEBOUNCE_LIMIT) Flux.next('controller|button|blue', pushTime);
		else log.info('Blue button pushed not enough:', pushTime);
	});

	/** Interval for switch state + random actions */
	var instance = false,
		intervalEtat;
	const INTERVAL_DELAY = (Odi.conf('watcher') ? 60 : 5 * 60) * 1000; //3 * 60 * 1000;
	setInterval(function() {
		// A deplacer dans flux.next('interface|runtime|refresh')) ?
		let value = etat.readSync();
		//TODO faire un truc avec ce flux
		Flux.next('interface|led|toggle', { leds: ['satellite'], value: value }, { hidden: true });

		if (1 === value) {
			if (!instance) {
				// TODO! deplacer ça dans le handler ... !?
				instance = true;
				intervalEtat = setInterval(function() {
					log.info('Etat btn Up => random action');
					Flux.next('service|interaction|random');
				}, INTERVAL_DELAY);
			}
		} else {
			instance = false;
			clearInterval(intervalEtat);
		}
	}, 2000);

	/** Switch watch for radio volume */
	etat.watch(function(err, value) {
		value = etat.readSync();
		log.INFO('..btn', value);
		Odi.run('etat', value ? 'high' : 'low');
		Odi.run('volume', Odi.isAwake() ? (value ? 400 : -400) : 'mute');
		log.info('Etat:', value, '[Etat has changed]');
		if (Odi.run('music') == 'fip') {
			Flux.next('interface|sound|mute');
			Flux.next('service|music|fip', null, { delay: 0.1 });
		}
		log.table(Odi.run(), 'RUNTIME...');
	});
}

function initButtonSleep() {
	ok.watch(function(err, value) {
		var pushTime = getPushTime(ok);
		// Flux.next('controller|button|ok', pushTime);
		Flux.next('service|system|restart');
	});
}

var pushTime, pushedTime;
function getPushTime(button) {
	pushedTime = new Date();
	while (button.readSync() == 1) {
		var t = Math.round((new Date() - pushedTime) / 100) / 10;
		if (t % 1 == 0) belly.write(0);
		else belly.write(1);
	}
	belly.write(0);
	pushTime = Math.round((new Date() - pushedTime) / 100) / 10;
	log.info(button.name + ' button pressed for ' + pushTime + ' sec...');
	return pushTime;
}
