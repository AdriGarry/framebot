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
				setVolume(flux.value);
			} else if (flux.id == 'play') {
				playSound(flux.value);
			} else if (flux.id == 'error') {
				// spawn('sh', [Odi._SHELL + 'sounds.sh', 'error']);
				playSound({ mp3: 'system/error.mp3' });
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

function setVolume(volume) {
	log.info('setVolume()', volume);
}

function playSound(arg) {
	log.debug(arg);
	var mp3Title;
	try {
		mp3Title = arg.mp3.match(/\/.+.mp3/gm)[0].substr(1);
	} catch (err) {
		mp3Title = arg.mp3;
	}
	var durationLog = arg.duration
		? 'duration=' + (Math.floor(arg.duration / 60) + 'm' + Math.round(arg.duration % 60))
		: '';
	var volLog = arg.volume ? 'vol=' + arg.volume : '';
	var positionLog = arg.position ? 'pos=' + arg.position : '';
	log.info('play', mp3Title, volLog, positionLog, durationLog);

	// position=$(shuf -i 0-20000 -n 1) // TODO !!
	var position = arg.position || 0;
	var volume = arg.volume || Odi.run.volume;
	var sound = Odi._MP3 + arg.mp3;
	//exec('omxplayer -o local --pos ' + position + ' --vol ' + volume + ' ' + sound);
	var startPlayTime = new Date();
	Utils.execCmd('omxplayer -o local --pos ' + position + ' --vol ' + volume + ' ' + sound, function(callback) {
		// always log callback
		if (callback.toString().indexOf('have a nice day') == -1) {
			log.info(callback);
		}
		log.INFO('play end. time:', Utils.getExecutionTime(startPlayTime));
	});
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
