#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

Flux.interface.sound.subscribe({
	next: flux => {
		if (flux.id == 'mute') {
			mute(flux.value);
		} else if (Odi.isAwake()) {
			if (flux.id == 'volume') {
				setVolume(flux.value);
			} else if (flux.id == 'play') {
				playSound(flux.value);
			} else if (flux.id == 'error') {
				playSound({ mp3: 'system/ressort.mp3' }, 'noLog');
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

function playSound(arg, noLog) {
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
	if (!noLog) log.info('play', mp3Title, volLog, positionLog, durationLog);

	var position = arg.position || 0;
	var volume = arg.volume || Odi.run('volume');
	var sound = Odi._MP3 + arg.mp3;
	var startPlayTime = new Date();
	Utils.execCmd('omxplayer -o local --pos ' + position + ' --vol ' + volume + ' ' + sound, function(callback) {
		// always log callback
		if (callback.toString().indexOf('have a nice day') >= 0) {
			if (!noLog) log.info('play end. time=' + Math.round(Utils.executionTime(startPlayTime) / 100) / 10 + 'sec');
		} else {
			console.log(callback);
			Odi.error('File not found', callback.unQuote(), false);
		}
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
	Flux.next('interface|tts|clearTTSQueue', null, { hidden: true });
	Flux.next('service|music|stop', null, { hidden: true });
	spawn('sh', [Odi._SHELL + 'mute.sh']);
	log.info('>> MUTE  -.-', message ? '"' + message + '"' : '');
	Flux.next('interface|led|clearLeds', null, { hidden: true });
	Flux.next('interface|led|toggle', { leds: ['eye', 'belly'], value: 0 }, { hidden: true });
	Odi.run('music', false);
}

// sudo amixer set PCM 100%
spawn('amixer', [' set PCM 100%']); // TODO TOTEST: Default volume & output
