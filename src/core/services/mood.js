#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

Flux.service.mood.subscribe({
	next: flux => {
		// if (!Flux.inspect(flux, subject)) return;
		log.info('Mood service', flux);
	},
	error: err => {
		Odi.error(flux);
	}
});

// Test pour lancer les anniversaires d'ici ? (ou alors dans un calendar.js ?)