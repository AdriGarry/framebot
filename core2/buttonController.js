#!/usr/bin/env node
'use strict'

const Gpio = require('onoff').Gpio;
const Observable = require('rxjs').Observable;

const ok = new Gpio(20, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
const cancel = new Gpio(16, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});

module.exports.init = Observable.create((observer) => {

	ok.watch(function(err, value){
		var pushTime = getPushTime(ok);
		observer.next({id:'ok', value:pushTime});
	});
	cancel.watch(function(err, value){
		var pushTime = getPushTime(cancel);
		observer.next({id:'cancel', value:pushTime});
	});
	observer.next('Button initialized');

	setTimeout(()=> observer.next('Step 1'), 1500);
	setTimeout(()=> observer.next('Step 2'), 3000);

});

function getPushTime(button){
	var pushTime, pushedTime = new Date();
	while(button.readSync() == 1){
		; // Pause
		var t = Math.round((new Date() - pushedTime)/100)/10;
	}
	pushTime = Math.round((new Date() - pushedTime)/100)/10;
	return pushTime;
}
