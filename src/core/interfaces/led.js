#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
// const Flux = require(Core._CORE + 'Flux.js');
const Gpio = require('onoff').Gpio;
const CronJob = require('cron').CronJob;

var Led = {};

Core.gpio.leds.forEach(led => {
	Led[led.id] = new Gpio(led.pin, led.direction);
});

Core.flux.interface.led.subscribe({
	next: flux => {
		//log.info(flux, '(you are in the led module !)');
		if (flux.id == 'toggle') {
			toggle(flux.value);
		} else if (flux.id == 'blink') {
			blink(flux.value);
		} else if (flux.id == 'altLeds') {
			altLeds(flux.value);
		} else if (flux.id == 'clearLeds') {
			clearLeds();
		} else Core.error('unmapped flux in Led interface', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

// blink({leds:['belly', 'satellite'],loop:5, speed:70});

/** Fonction clignotement
 * @param config : {
 * 	leds : ['eye', 'satellite'...]
 *		speed : number (50 - 200)
 *		loop : number (<1)
 *	}
 */
function blink(config) {
	try {
		var etat = 1,
			loop;
		if (config.hasOwnProperty('leds')) {
			setTimeout(function() {
				for (var led in config.leds) {
					Led[config.leds[led]].write(0);
				}
			}, config.speed * config.loop * 2 + 50);
			for (loop = config.loop * 2; loop > 0; loop--) {
				setTimeout(
					function(leds) {
						for (var i in leds) {
							var led = leds[i];
							Led[led].write(etat);
						}
						etat = 1 - etat;
					},
					config.speed * loop,
					config.leds
				);
			}
		}
	} catch (e) {
		Core.error(e);
	}
}

/** Function to toggle a led
 * @param config : {
 * 	leds : 'eye'
 *		value : true/false
 } */
function toggle(config) {
	// log.info('toogle:', config);
	// if (['nose', 'eye', 'satellite', 'belly'].indexOf(config.led) > -1) {
	for (var led in config.leds) {
		Led[config.leds[led]].write(config.value ? 1 : 0);
	}
	if (Object.keys(Led).indexOf(config.led) > -1) {
		Led[config.led].write(config.mode ? 1 : 0);
	}
}

/** Function activity : program mode flag (ready/sleep/test) */
(function activity(mode) {
	log.info('Activity led initialised [' + mode + ']');
	//mode = parseInt(mode, 10);
	if (mode == 'sleep') mode = 0;
	else mode = 1;
	setInterval(function() {
		Led.nose.write(mode);
	}, 900);

	new CronJob( //TODO mettre dans jobs.json (une fois le mode trace défini)
		'*/3 * * * * *',
		function() {
			blink({ leds: ['nose'], speed: 200, loop: 1 });
		},
		null,
		1,
		'Europe/Paris'
	);
})(Core.conf('mode'));

/** Function to start inverted blink (Eye/Belly) */
var timer;
function altLeds(args) {
	// args : {speed, duration}
	clearInterval(timer);
	let etat = 1;
	timer = setInterval(function() {
		Led.eye.write(etat);
		etat = 1 - etat;
		Led.belly.write(etat);
	}, args.speed);
	setTimeout(function() {
		clearInterval(timer);
		Led.eye.write(0);
		Led.belly.write(0);
	}, args.duration * 1000);
}

/** Function to cancel blinkState */
function clearLeds() {
	clearInterval(timer);
}

/** Function to switch on all leds */
function allLedsOn() {
	Led.eye.write(1);
	Led.belly.write(1);
	Led.satellite.write(1);
	Led.nose.write(1); // EXCEPT ACTIVITY LED ??
}

/** Function to swith off all leds */
function allLedsOff() {
	Led.eye.write(0);
	Led.belly.write(0);
	Led.satellite.write(0);
	Led.nose.write(0); // EXCEPT ACTIVITY LED ??
}

/** Params detection for direct call */
/*var params = process.argv[2];
if (params) {
	// console.log('leds params:', params);
	var gpioPins = require('./gpioPins.js');
	if (params === 'allLedsOn') {
		console.log('All Leds On');
		allLedsOn();
	} else if (params === 'allLedsOff') {
		console.log('All Leds Off');
		allLedsOff();
	}
}*/
