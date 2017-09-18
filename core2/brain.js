#!/usr/bin/env node
'use strict'

const Observable = require('rxjs').Observable;
//var service1 = require('/home/pi/odi/core2/service1.js');


FLUX.out = Observable.create((observer) => {

	// FLUX.button.subscribe((data) => {
	// 	//console.log(data)
	// 	if(data.id == 'ok'){
	// 		console.log('Launching function associated to Ok button...', data.value);
	// 		observer.next({id:'bip', value: 'ok'});
	// 	}
	// 	if(data.id == 'cancel'){
	// 		console.log('Launching function associated to Cancel button...', data.value);
	// 		observer.next({id:'bip', value:'cancel'});
	// 	}
	// });

	FLUX.button.subscribe({
		next: data => {
			console.log('Brain:', data);
			if(data.id == 'ok'){
				console.log('Launching function associated to Ok button...', data.value);
				observer.next({id:'bip', value: 'ok'});
			}else if(data.id == 'cancel'){
				console.log('Launching function associated to Cancel button...', data.value);
				observer.next({id:'bip', value:'cancel'});
			}else if(data.id == 'blue'){
				throw new Error('Odi Error to define');
			}else{
				console.log('else statement, do nothing...');
			}
		},
		error: err => console.error('error in brain: ' + err)
	});


	// setTimeout(()=> observer.next('Step 1'), 1500);
	// setTimeout(()=> observer.next('Step 2'), 3000);
});

