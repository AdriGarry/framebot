#!/usr/bin/env node
'use strict'

// var config = require('/home/pi/odi/core3/core/config.js');
// var flux = require(config.CORE_PATH + 'flux.js');
var ODI = require(ODI_PATH + 'core/context.js');

console.log('--timeService');
console.log(ODI.flux);

/*ODI.flux.action2.subscribe({
	next: data => console.log('timeService: ' + data),
	error: err => console.error('error in timeService ' + err)
});*/
