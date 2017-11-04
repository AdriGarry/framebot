#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Gpio = require('onoff').Gpio;
var belly = new Gpio(17, 'out');
// belly.write(1);
// TODO => créer une boucle pour les construire dynamiquement !
var ok = new Gpio(20, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var cancel = new Gpio(16, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var white = new Gpio(19, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
var blue = new Gpio(26, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });

var Flux = require(Odi._CORE + 'Flux.js');

// if(Odi.conf.mode == 'sleep') initButtonSleep();
// else initButtonReady();
initButtonReady();

function initButtonReady(){
	ok.watch(function(err, value) {
		var pushTime = getPushTime(ok);
		//oneMorePush();
		Flux.next('controller', 'button', 'ok', pushTime);
	});

	cancel.watch(function(err, value) {
		var pushTime = getPushTime(cancel);
		Flux.next('controller', 'button', 'cancel', pushTime);
	});

	white.watch(function(err, value) {
		var pushTime = getPushTime(white);
		Flux.next('controller', 'button', 'white', pushTime);
	});

	blue.watch(function(err, value) {
		var pushTime = getPushTime(blue);
		Flux.next('controller', 'button', 'blue', pushTime);
	});

	// var pushed = 0,
	// 	pushedLimit = 3;
	// function oneMorePush() {
	// 	clearTimeout(pushTimeout);
	// 	var pushTimeout = setTimeout(function() {
	// 		pushed = 0;
	// 	}, 5000);
	// 	pushed++;
	// 	console.log('oneMorePush', pushed + '/' + pushedLimit);
	// 	if (pushed >= pushedLimit) {
	// 		switch (Math.round(Math.random() * 2)) {
	// 			case 0:
	// 				// ODI.tts.speak({ msg: 'Et ho ! Arraite un peu avec mes boutons tu veux' });
	// 				break;
	// 			case 1:
	// 				// ODI.tts.speak({ msg: 'Arraite de me toucher, sa menairve !' });
	// 				break;
	// 			case 2:
	// 				// ODI.tts.speak({ msg: 'Pas touche a mes boutons !' });
	// 				break;
	// 		}
	// 		pushed = 0;
	// 	}
	// }
}

function initButtonSleep(){
	ok.watch(function(err, value) {
		var pushTime = getPushTime(ok);
		// Flux.next('controller', 'button', 'ok', pushTime);
		Flux.next('service', 'system', 'restart', null);
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
	return pushTime;
}
// belly.write(0);
