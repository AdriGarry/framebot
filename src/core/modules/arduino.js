#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

Flux.module.arduino.subscribe({
	// TODO: ABSOLUMENT BLOQUER LES SONS EN MODE SLEEP !!
	next: flux => {
		if (flux.id == 'aa1') {
			//
		} else if (Odi.isAwake()) {
			if (flux.id == 'aa2') {
				//
			} else if (flux.id == 'aa3') {
				//
			} else {
				Odi.error('unmapped flux in Arduino module', flux, false);
			}
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function to ... */
function toto() {
	log.info('toto()');
}
