#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

Flux.module.sound.subscribe({
	// TODO: ABSOLUMENT BLOQUER LES SONS EN MODE SLEEP !!
	next: flux => {
		if (flux.id == 'mute') {
			mute(flux.value);
		} else if (Odi.isAwake()) {
			if (flux.id == 'volume') {
				// todo setVolume(flux.value);
			} else if (flux.id == 'play') {
				playSound(flux.value);
			} else if (flux.id == 'error') {
				spawn('sh', [Odi._SHELL + 'sounds.sh', 'error']);
			} else if (flux.id == 'UI') {
				spawn('sh', [Odi._SHELL + 'sounds.sh', 'UIRequest']);
			} else {
				Odi.error('unmapped flux in Sound module', flux, false);
			}
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

function setVolume(volume) {}

function playSound(arg) {
	var mp3Title = arg.mp3.match(/\/.+.mp3/gm)[0].substr(1);

	// var durationLog = arg.duration ? 'duration=' + duration : '';
	// var volLog = arg.volume ? 'vol=' + arg.volume : '';
	// var positionLog = arg.position ? 'pos=' + arg.position : '';
	// log.info('play', mp3Title, volLog, positionLog, durationLog);

	log.info('play', mp3Title, arg.volume ? 'vol=' + arg.volume : '', arg.position ? 'pos=' + arg.position : '');
	// position=$(shuf -i 0-20000 -n 1) // TODO !!
	var position = arg.position || 0;
	var volume = arg.volume || Odi.run.volume;
	var sound = Odi._MP3 + arg.mp3;
	exec('omxplayer -o local --pos ' + position + ' --vol ' + volume + ' ' + sound);
}

var muteTimer, delay;
/** Function to mute Odi (delay:min) */
function mute(args) {
	clearTimeout(muteTimer);
	if (!args) args = {};
	if (args.hasOwnProperty('delay') && Number(args.delay)) {
		muteTimer = setTimeout(function() {
			spawn('sh', [Odi._SHELL + 'mute.sh', 'auto']);
			setTimeout(function() {
				stopAll(args.message || null);
			}, 1600);
		}, Number(args.delay) * 1000);
	} else {
		stopAll(args.message || null);
	}
}

/** Function to stop all sounds & leds */
function stopAll(message) {
	Flux.next('module', 'tts', 'clearTTSQueue', null, null, null, 'hidden');
	Flux.next('service', 'music', 'stop', null, null, null, 'hidden');
	spawn('sh', [Odi._SHELL + 'mute.sh']);
	log.info('>> MUTE  -.-', message ? '"' + message + '"' : '');
	Flux.next('module', 'led', 'clearLeds', null, null, null, 'hidden');
	Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly'], value: 0 }, null, null, 'hidden');
}
