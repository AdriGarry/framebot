#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);
log.debug('sound module initialized');

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.module.sound.subscribe({
	next: data => {
		log.info('soundService: ', data);
	},
	error: err => {
		log.info('error in soundService: ', err);
	}
});
