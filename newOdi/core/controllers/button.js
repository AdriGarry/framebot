#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

const Gpio = require('onoff').Gpio;
// TODO => créer une boucle pour les construire dynamiquement !
var ok = new Gpio(20, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var cancel = new Gpio(16, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var white = new Gpio(19, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var blue = new Gpio(26, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });

const Rx = require('rxjs');
var Button = new Rx.Subject();
module.exports = Button;

var Flux = require(Odi.CORE_PATH + 'Flux.js');

ok.watch(function (err, value) {
	var pushTime = getPushTime(ok);
	if (pushTime == 0) {
		Flux.next('controller', 'button', 'ok', pushTime);
	} else {
		Flux.next('controller', 'button', 'ok', pushTime);
	}
});

cancel.watch(function (err, value) {
	var pushTime = getPushTime(cancel);
	Flux.next('controller', 'button', 'red', pushTime);
});

white.watch(function (err, value) {
	var pushTime = getPushTime(cancel);
	Flux.next('controller', 'button', 'white', pushTime);
});

blue.watch(function (err, value) {
	var pushTime = getPushTime(cancel);
	// observer.error({ id: 'Blue button pressed ==> temporary in error.', value: pushTime });
	Odi.error('Blue button pressed ==> temporary in error.');
});

Button.next('Button controller initialized');

function getPushTime(button) {
	var pushTime/* = 0*/, pushedTime = new Date();
	while (button.readSync() == 1) {
		;; // Pause
		// console.log(t);
		//var t = Math.round((new Date() - pushedTime)/100)/10;

		/*if(t%1 == 0){ // TODO emettre des events directement pour allumer la led
			// console.log(t);
			// process.stdout.write('.');
			Odi.leds.belly.write(0);
		}else{
			Odi.leds.belly.write(1);
		}*/
	}
	pushTime = Math.round((new Date() - pushedTime) / 100) / 10;
	return pushTime;
}
