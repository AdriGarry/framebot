#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');

console.log('--timeService');

ODI.flux.action.subscribe({
	next: data => {
		console.log('timeService: ', data);
	},
	error: err => {
		console.log('error in timeService: ', err);
	}
});
