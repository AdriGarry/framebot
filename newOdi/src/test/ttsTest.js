#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.info('TTS test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi.CORE_PATH + 'Flux.js');

module.exports.run = function(callback) {
	Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'Test' });

	setTimeout(() => {
		Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'Test' });
		// TODO test à implémenter : laisser un voiceMail, le jouer, et le supprimer
	}, 2000);

	setTimeout(() => {
		callback('ttsTest', true);
	}, 15000);
};
