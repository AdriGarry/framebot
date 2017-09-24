#!/usr/bin/env node
'use strict'

const Gpio = require('onoff').Gpio;
const Observable = require('rxjs').Observable;

var ODI = require(ODI_PATH + 'core/shared.js');

// TODO => créer une boucle pour les construire dynamiquement !
const ok = new Gpio(20, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
const cancel = new Gpio(16, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
const white = new Gpio(19, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
const blue = new Gpio(26, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});

ODI.flux.button = Observable.create((observer) => {

	ok.watch(function(err, value){
		var pushTime = getPushTime(ok);
		observer.next({id:'ok', value:pushTime});
	});

	cancel.watch(function(err, value){
		var pushTime = getPushTime(cancel);
		observer.next({id:'cancel', value:pushTime});
	});

	white.watch(function(err, value){
		var pushTime = getPushTime(cancel);
		observer.next({id:'white', value:pushTime});
	});

	blue.watch(function(err, value){
		var pushTime = getPushTime(cancel);
		observer.next({id:'blue', value:pushTime});
	});

	observer.next('Button initialized');
});

function getPushTime(button){
	var pushTime/* = 0*/, pushedTime = new Date();
	while(button.readSync() == 1){
		;; // Pause
		// console.log(t);
		var t = Math.round((new Date() - pushedTime)/100)/10;
	}
	pushTime = Math.round((new Date() - pushedTime)/100)/10;
	return pushTime;
}
