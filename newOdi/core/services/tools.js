#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename);

var brain = require (Odi.CORE_PATH + 'brain.js');

brain.service.tools.subscribe({
	next: flux => {
		if(!brain.inspect(flux, 'Tools')) return;
		log.info('Tools service', flux);
	},
	error: err => { Odi.error(flux) }
});
