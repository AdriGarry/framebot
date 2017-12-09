#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');
var spawn = require('child_process').spawn;
var fs = require('fs');

Flux.service.music.subscribe({
	next: flux => {
		if (flux.id == 'jukebox') {
			jukebox();
		} else if (flux.id == 'fip') {
			playFip();
		} else if (flux.id == 'stop') {
			stop();
		} else Odi.error('unmapped flux in Music service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

var ledMusicFlag;
function ledFlag() {
	ledMusicFlag = setInterval(function() {
		if (Odi.run.music) {
			Flux.next('module', 'led', 'altLeds', { speed: 100, duration: 1.3 }, null, null, true);
		} else {
			clearInterval(ledMusicFlag);
		}
	}, 13 * 1000);
}

var JUKEBOX_SONGS;
fs.readdir(Odi._MP3 + 'jukebox', (err, files) => {
	JUKEBOX_SONGS = files;
});
// var jukeboxSongsCycle = JUKEBOX_SONGS;

/** Function jukebox (repeat for one hour) */
function jukebox(message) {
	stop();
	log.info('Jukebox in loop mode !');
	Odi.run.music = true;
	ledFlag();
	playOneSong();
	console.log('--');
	// wait to launch next song...
	Flux.next('module', 'sound', 'mute', { message: 'Auto mute jukebox !', delay: 2 }, 60 * 60);
}

function playOneSong() {
	var song = Utils.randomItem(JUKEBOX_SONGS);
	Flux.next('module', 'sound', 'play', { mp3: 'jukebox/' + song });
}

/** Function jukebox (repeat) */
function jukeboxOLD(message) {
	// if (Odi.run.music) {
	// 	Flux.next('module', 'sound', 'mute');
	// }
	stop();
	setTimeout(function() {
		log.info('Jukebox in loop mode !');
		spawn('sh', [Odi._SHELL + 'jukebox.sh']);
		Odi.run.music = true;
		ledFlag();
		Flux.next('module', 'sound', 'mute', { message: 'Auto mute jukebox !', delay: 2 }, 60 * 60);
	}, 500);
}

/** Function medley jukebox (repeat) */
function medley(message) {
	// if (Odi.run.music) {
	// 	Flux.next('module', 'sound', 'mute');
	// }
	stop();
	setTimeout(function() {
		log.info('Jukebox in medley mode !');
		spawn('sh', [Odi._SHELL + 'jukebox.sh', 'medley']);
		Odi.run.music = true;
		ledFlag();
		Flux.next('module', 'sound', 'mute', { message: 'Auto mute jukebox !', delay: 2 }, 60 * 60);
	}, 500);
}

// var fipInterval;
/** Function to play FIP radio */
function playFip() {
	stop();
	log.info('Play FIP RADIO...');
	spawn('sh', [Odi._SHELL + 'fip.sh']);
	Odi.run.music = true;
	ledFlag();
	Flux.next('module', 'led', 'altLeds', { speed: 100, duration: 1.3 });

	Flux.next('module', 'sound', 'mute', { message: 'Auto Mute FIP', delay: 2 }, 60 * 60);
}

/** Function to stop music */
function stop(message) {
	if (Odi.run.music) {
		log.debug('Stop music');
		spawn('sh', [Odi._SHELL + 'mute.sh']);
		Odi.run.music = false;
		clearInterval(ledMusicFlag);
		Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly'], value: 0 }, null, null, true);
		Flux.next('module', 'led', 'clearLeds', { speed: 100, duration: 1.3 }, null, null, true);
	} else {
		log.debug('No music playing');
	}
}
