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
		} else if (flux.id == 'story') {
			playStory(flux.value);
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
	Flux.next('module', 'led', 'altLeds', { speed: 100, duration: 1.3 });
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
	// console.log('JUKEBOX_SONGS', JUKEBOX_SONGS);
});
// var jukeboxSongsCycle = JUKEBOX_SONGS;

/** Function jukebox (repeat for one hour) */
function jukebox(message) {
	stop();
	log.info('Jukebox in loop mode !');
	Odi.run.music = 'jukebox';
	ledFlag();
	repeatSong();
	Flux.next('module', 'sound', 'mute', { message: 'Auto mute jukebox !', delay: 2 }, 60 * 60);
}

var jukeboxTimeout;
function repeatSong() {
	log.info('next song...');
	var song = Utils.randomItem(JUKEBOX_SONGS);
	var ttime = new Date();
	Utils.getMp3Duration(Odi._MP3 + 'jukebox/' + song, function(duration) {
		console.log(Utils.getExecutionTime(ttime));
		// log.INFO('duration=' + duration);
		Flux.next('module', 'sound', 'play', { mp3: 'jukebox/' + song, duration: duration });
		jukeboxTimeout = setTimeout(function() {
			// log.INFO('Next song !!!', 'duration=' + duration);
			repeatSong();
		}, duration * 1000);
	});
}

function playOneSong() {
	var song = Utils.randomItem(JUKEBOX_SONGS);
	Flux.next('module', 'sound', 'play', { mp3: 'jukebox/' + song });
}

/** Function to play FIP radio */
function playFip() {
	stop();
	log.info('Play FIP RADIO...');
	spawn('sh', [Odi._SHELL + 'fip.sh']);
	Odi.run.music = 'fip';
	ledFlag();
	Flux.next('module', 'sound', 'mute', { message: 'Auto Mute FIP', delay: 2 }, 60 * 60);
}

/** Function to stop music */
function stop(message) {
	if (Odi.run.music) {
		log.debug('Stop music');
		clearTimeout(jukeboxTimeout);
		clearInterval(ledMusicFlag);
		spawn('sh', [Odi._SHELL + 'mute.sh']);
		Odi.run.music = false;
		Flux.next('module', 'led', 'toggle', { leds: ['eye', 'belly'], value: 0 }, null, null, true);
		Flux.next('module', 'led', 'clearLeds', { speed: 100, duration: 1.3 }, null, null, true);
	} else {
		log.debug('No music playing');
	}
}

const STORIES = ['stories/Donjon-De-Naheulbeuk.mp3', 'stories/Aventuriers-Du-Survivaure.mp3'];

/** Function to play a story */
function playStory(story) {
	var story;
	Flux.next('module', 'tts', 'speak', story);
	log.debug('Play story...', story);
	var storyToPlay = Utils.searchStringInArray(story, STORIES);
	// console.log(storyToPlay);
	if (storyToPlay) {
		Utils.getMp3Duration(Odi._MP3 + storyToPlay, function(length) {
			// console.log('length here==');
			// console.log(length);
			var position = Utils.random(1, Math.floor(length / 100 * 70)); // Position up to 70% of story duration
			stop();
			Odi.run.music = 'story';
			ledFlag();
			Flux.next('module', 'sound', 'play', { mp3: storyToPlay, position: position });
		});
	} else {
		Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'error history' });
	}
}
