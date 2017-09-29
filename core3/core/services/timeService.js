#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');
var log = new (require(ODI.path.CORE_PATH + 'logger.js'))(__filename.match(/(\w*).js/g)[0]);

var brain = require (ODI.path.CORE_PATH + 'brain.js');

brain.time.subscribe({
	next: data => {
		log.info('timeService: ', data);
	},
	error: err => {
		log.info('error in timeService: ', err);
	}
});
