#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');

console.log('--timeService');
console.log(ODI.flux);

/*ODI.flux.action2.subscribe({
	next: data => console.log('timeService: ' + data),
	error: err => console.error('error in timeService ' + err)
});*/
