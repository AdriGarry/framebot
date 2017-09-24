#!/usr/bin/env node
'use strict'

// Conductor.js ??

const Observable = require('rxjs').Observable;

// var config = require('/home/pi/odi/core3/core/config.js');
// var flux = require(config.CORE_PATH + 'flux.js');

var ODI = require(ODI_PATH + 'core/context.js');

console.log('--brain');
console.log(ODI.flux);

ODI.flux.action = Observable.create((observer) => {

	ODI.flux.button.subscribe({
		next: data => {
			// console.log('Brain:', data);
			if(data.id == 'ok'){
				console.log('Brain: Ok button', data.value);
				observer.next({id:'bip', value: 'ok'});
			}else if(data.id == 'cancel'){
				console.log('Brain: Cancel button...', data.value);
				observer.next({id:'bip', value:'cancel'});
			}else if(data.id == 'blue'){
				throw new Error('Brain: >> Odi Error to define');
			}else{
				console.log('Brain: else statement', data);
			}
		},
		// error: err => console.error('error in brain: ' + err)
		error: err => {throw new Error('Brain: error from button flux', err)}
	});
	setTimeout(()=> observer.next('Brain loaded'), 1000);
});

