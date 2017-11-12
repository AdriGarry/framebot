#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Odi._CORE + 'Utils.js');

log.info('Flux test sequence...');

const Rx = require('rxjs');

var Flux = require(Odi._CORE + 'Flux.js');

module.exports.run = function(callback) {

	Flux.next('service', 'time', 'today');
	Flux.next('service', 'time', 'now');
	Flux.next('service', 'time', 'OdiAge');

	// Flux.next('service', 'voicemail', 'new', {msg: 'are you there ?'}, 8);
	var conversation = Odi.ttsMessages.randomTTS[Utils.random(Odi.ttsMessages.randomTTS.length)];
	console.log(conversation);
	Flux.next('service', 'voicemail', 'new', conversation, 8);
	Flux.next('service', 'voicemail', 'check', null, 11);
	Flux.next('service', 'voicemail', 'clear', null, 15);

	setTimeout(() => {
		callback('serviceTest', true);
	}, 20000);
};
