#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');

console.log('--soundService');

ODI.flux.action.subscribe({
	next: data => {
		console.log('soundService: ', data);
	},
	error: err => {
		console.log('error in soundService: ', err);
	}
});
