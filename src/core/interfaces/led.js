#!/usr/bin/env node
'use strict';

const Gpio = require('onoff').Gpio,
	CronJob = require('cron').CronJob;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

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

//	Core.conf('mode');
let mode = Core.conf('mode');
//mode = parseInt(mode, 10);
if (mode == 'sleep') mode = 0;
else mode = 1;
setInterval(function() {
	Led.nose.writeSync(mode);
}, 900);

setInterval(function() {
	Led.nose.writeSync(mode);
}, 900);

new CronJob( //TODO mettre dans jobs.json (une fois le mode trace défini)
	'*/3 * * * * *', // TODO tester de mettre aussi dans un setInterval
	function() {
		blink({ leds: ['nose'], speed: 200, loop: 1 });
	},
	null,
	1,
	'Europe/Paris'
);
log.info('Activity led initialised [' + mode + ']');

setImmediate(() => {});

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
					Led[config.leds[led]].writeSync(0);
				}
			}, config.speed * config.loop * 2 + 50);
			for (loop = config.loop * 2; loop > 0; loop--) {
				setTimeout(
					function(leds) {
						for (var i in leds) {
							var led = leds[i];
							Led[led].writeSync(etat);
						}
						etat = 1 - etat;
					},
					config.speed * loop,
					config.leds
				);
			}
		}
	} catch (err) {
		Core.error(err);
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
		Led[config.leds[led]].writeSync(config.value ? 1 : 0);
	}
	if (Object.keys(Led).indexOf(config.led) > -1) {
		Led[config.led].writeSync(config.mode ? 1 : 0);
	}
}

/** Function to start inverted blink (Eye/Belly) */
var timer;
function altLeds(args) {
	// args : {speed, duration}
	clearInterval(timer);
	let etat = 1;
	timer = setInterval(function() {
		Led.eye.writeSync(etat);
		etat = 1 - etat;
		Led.belly.writeSync(etat);
	}, args.speed);
	setTimeout(function() {
		clearInterval(timer);
		Led.eye.writeSync(0);
		Led.belly.writeSync(0);
	}, args.duration * 1000);
}

/** Function to cancel blinkState */
function clearLeds() {
	clearInterval(timer);
}

/** Function to switch on all leds */
function allLedsOn() {
	Led.eye.writeSync(1);
	Led.belly.writeSync(1);
	Led.satellite.writeSync(1);
	Led.nose.writeSync(1); // EXCEPT ACTIVITY LED ??
}

/** Function to swith off all leds */
function allLedsOff() {
	Led.eye.writeSync(0);
	Led.belly.writeSync(0);
	Led.satellite.writeSync(0);
	Led.nose.writeSync(0); // EXCEPT ACTIVITY LED ??
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
