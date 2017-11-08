#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

Flux.service.mood.subscribe({
	next: flux => {
		if (flux.id == '') {
			//
		}else Odi.error('unmapped flux in Mood service', flux, false);
		
	},
	error: err => {
		Odi.error(flux);
	}
});

// Test pour lancer les anniversaires d'ici ? (ou alors dans un calendar.js ?)