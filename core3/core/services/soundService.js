#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');
var log = new (require(ODI.path.CORE_PATH + 'logger.js'))(__filename.match(/(\w*).js/g)[0]);

log.info('--soundService');

ODI.flux.action.subscribe({
	next: data => {
		console.log('soundService: ', data);
	},
	error: err => {
		console.log('error in soundService: ', err);
	}
});
