#!/usr/bin/env node
'use strict'

// var config = require('/home/pi/odi/core3/core/config.js');
// var flux = require(config.CORE_PATH + 'flux.js');
var ODI = require(ODI_PATH + 'core/context.js');

console.log('--soundService');
console.log(ODI.flux);
console.log(ODI.flux.action);

ODI.flux.action.subscribe({
	next: data => console.log('soundService: ' + data),
	error: err => console.error('error in soundService ' + err)
});
console.log('out from soundService');