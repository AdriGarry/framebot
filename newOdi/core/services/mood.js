#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.service.mood.subscribe({
	next: flux => {
		if(!brain.inspect(flux, 'Mood')) return;
		log.info('Mood service', flux);
	},
	error: err => { Odi.error(flux) }
});
