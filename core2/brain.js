#!/usr/bin/env node
'use strict'

//var service1 = require('/home/pi/odi/core2/service1.js');

FLUX.button.subscribe((data) => {
	console.log(data)
	if(data.id == 'ok'){
		console.log('Ok button pressed for', data.value, 'sec');
		service1.doSomething('toto');
	}
	if(data.id == 'cancel'){
		console.log('Cancel button pressed for', data.value, 'sec');
		service1.doSomethingElse('TOTO');
	}
});
