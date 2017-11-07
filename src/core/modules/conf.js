#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;

Flux.module.sound.subscribe({
	next: flux => {
		if (flux.id == 'update') {
		} else if (flux.id == 'updateDefault') {
		} else if (flux.id == 'reset') {
		}else Odi.error('unmapped flux in Time service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

function setVolume(volume) {}
