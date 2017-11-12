#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;

// const asleep = Odi.conf.mode != 'sleep';
// console.log(Odi.conf.mode != 'sleep');

Flux.service.interaction.subscribe({ // TODO: ABSOLUMENT BLOQUER LES SONS EN MODE SLEEP !!
	next: flux => {
		if (flux.id == 'exclamation' && !Odi.asleep()) {
			exclamation();
		} else if (flux.id == '' && !Odi.asleep()) {
		}else Odi.error('unmapped flux in Exclamation module', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

function exclamation() {
	log.INFO('exclamation');
}

