#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

var Gpio = require('onoff').Gpio;
var CronJob = require('cron').CronJob;

const odiLeds = {
	eye: new Gpio(14, 'out'),
	nose: new Gpio(15, 'out'),
	belly: new Gpio(17, 'out'),
	satellite: new Gpio(23, 'out')
};

allLedsOn();
setTimeout(function() {
	allLedsOff();
}, 300);

//module.exports.attachToFlux = {};

// todo faire des séquences de clignottements pour pouvoir les arrêter...
var ledSequences = [];

Flux.module.led.subscribe({
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
		} else if (flux.id == 'activity') {
			activity(flux.value);
		} else {
			log.info('Led flux not mapped', flux);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

// blink({leds:['belly', 'satellite'],loop:5, speed:70});

/** Fonction clignotement
 * @param config : {
 * 	leds : ['eye', 'satellite'...]
 *		speed : number (50 - 200)
 *		loop : number (<1)
 } */
function blink(config) {
	// console.log(config);
	try {
		var etat = 1, loop;
		if (config.hasOwnProperty('leds')) {
			setTimeout(function() {
				for (var led in config.leds) {
					odiLeds[config.leds[led]].write(0);
				}
			}, config.speed * config.loop * 2 + 50);
			for (loop = config.loop * 2; loop > 0; loop--) {
				setTimeout(
					function(leds) {
						for (var i in leds) {
							var led = leds[i];
							// console.log('led : ' + led);
							//eval(led).write(etat); // TODO remplacer eval
							odiLeds[led].write(etat);
						}
						etat = 1 - etat; // VOIR POUR ALTERNER ??
					},
					config.speed * loop,
					config.leds
				);
			}
		}
	} catch (e) {
		Odi.error(e);
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
		odiLeds[config.leds[led]].write(config.value ? 1 : 0);
	}
	if (Object.keys(odiLeds).indexOf(config.led) > -1) {
		odiLeds[config.led].write(config.mode ? 1 : 0);
	}
}

/** Function activity : program mode flag (ready/sleep/test) */
(function activity(mode) {
	//if(typeof mode === 'undefined') mode = 'awake';
	//if(mode == 'ready') mode = 'awake';
	log.info('Activity led initialised [' + mode + ']');
	//mode = parseInt(mode, 10);
	if (mode == 'sleep') mode = 0;
	else mode = 1;
	setInterval(function() {
		odiLeds.nose.write(mode);
	}, 900);

	new CronJob(
		'*/3 * * * * *',
		function() {
			blink({ leds: ['nose'], speed: 200, loop: 1 });
			//blink({ leds: ['nose'], speed: Odi.conf.mode == 'test' ? 100 : 200, loop: (Odi.conf.mode = 'test' ? 2 : 1) });
		},
		null,
		1,
		'Europe/Paris'
	);
	// new CronJob('*/3 * * * * *', function() {
	// 	blink({ leds: ['nose'], speed: 200, loop: 1 }); // Initialisation du temoin d'activite 2/2
	// },	null,	1,	'Europe/Paris');
})(Odi.conf.mode);

/** Function to start inverted blink (Eye/Belly) */
var timer;
function altLeds(args) { // args : {speed, duration}
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function() {
		odiLeds.eye.write(etat);
		etat = 1 - etat;
		odiLeds.belly.write(etat);
	}, args.speed);
	var stopTimer = setTimeout(function() {
		clearInterval(timer);
		odiLeds.eye.write(0);
		odiLeds.belly.write(0);
	}, args.duration * 1000);
}

/** Function to cancel blinkState */
function clearLeds() {
	clearInterval(timer);
}

/** Function pushed button flag */
/*function buttonPush(param){
	if(param == 'stop'){
		belly.write(0);
	}else{
		belly.write(1);
		setInterval(function(){
			belly.write(1);
		}, 300);
		setTimeout(function(){
			belly.write(1);
		}, 1000);		
	}
};*/

/** Function to switch on all leds */
function allLedsOn() {
	odiLeds.eye.write(1);
	odiLeds.belly.write(1);
	odiLeds.satellite.write(1);
	odiLeds.nose.write(1); // EXCEPT ACTIVITY LED ??
}

/** Function to swith off all leds */
function allLedsOff() {
	odiLeds.eye.write(0);
	odiLeds.belly.write(0);
	odiLeds.satellite.write(0);
	odiLeds.nose.write(0); // EXCEPT ACTIVITY LED ??
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
