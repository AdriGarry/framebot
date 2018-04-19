#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename);
const Flux = require(Odi._CORE + 'Flux.js');
const Utils = require(Odi._CORE + 'Utils.js');
const RandomBox = require('randombox').RandomBox;
const spawn = require('child_process').spawn;
const fs = require('fs');

Flux.service.music.subscribe({
	next: flux => {
		if (flux.id == 'jukebox') {
			jukebox();
		} else if (flux.id == 'fip') {
			playFip();
		} else if (flux.id == 'fipOrJukebox') {
			playFipOrJukebox();
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
	Flux.next('interface|led|altLeds', { speed: 100, duration: 1.3 });
	ledMusicFlag = setInterval(function() {
		if (Odi.run('music')) {
			Flux.next('interface|led|altLeds', { speed: 100, duration: 1.3 }, { hidden: true });
		} else {
			clearInterval(ledMusicFlag);
		}
	}, 13 * 1000);
}

/** Function jukebox (repeat for one hour) */
function jukebox(message) {
	stop();
	log.info('Jukebox in loop mode !');
	Odi.run('music', 'jukebox');
	ledFlag();
	repeatSong();
	Flux.next('interface|sound|mute', { message: 'Auto mute jukebox !', delay: 2 }, { delay: 60 * 60 });
}

var jukeboxTimeout, jukeboxRandomBox;

// var JUKEBOX_SONGS;
fs.readdir(Odi._MP3 + 'jukebox', (err, files) => {
	// JUKEBOX_SONGS = files;
	jukeboxRandomBox = new RandomBox(files);
	// console.log('JUKEBOX_SONGS', JUKEBOX_SONGS);
});

function repeatSong() {
	log.info('next song...');
	// let song = Utils.randomItem(JUKEBOX_SONGS);
	let song = jukeboxRandomBox.next();
	let ttime = new Date();
	Utils.getMp3Duration(Odi._MP3 + 'jukebox/' + song, function(duration) {
		console.log(Utils.executionTime(ttime));
		// log.INFO('duration=' + duration);
		Flux.next('interface|sound|play', { mp3: 'jukebox/' + song, duration: duration });
		jukeboxTimeout = setTimeout(function() {
			// log.INFO('Next song !!!', 'duration=' + duration);
			repeatSong();
		}, duration * 1000);
	});
}

function playOneSong() {
	// DEPRECATED ? (never called?)
	log.INFO("music.playOneSong() => shouldn't be CONNREFUSED...");
	// var song = Utils.randomItem(JUKEBOX_SONGS);
	let song = jukeboxRandomBox.next();
	Flux.next('interface|sound|play', { mp3: 'jukebox/' + song });
}

/** Function to play FIP radio */
function playFip() {
	stop();
	log.info('Play FIP RADIO...');
	spawn('sh', [Odi._SHELL + 'fip.sh']);
	Odi.run('music', 'fip');
	ledFlag();
	Flux.next('interface|sound|mute', { message: 'Auto Mute FIP', delay: 2 }, { delay: 60 * 60 });
}

/** Function to stop music */
function stop(message) {
	if (Odi.run('music')) {
		log.debug('Stop music');
		clearTimeout(jukeboxTimeout);
		clearInterval(ledMusicFlag);
		spawn('sh', [Odi._SHELL + 'mute.sh']);
		Odi.run('music', false);
		Flux.next('interface|led|toggle', { leds: ['eye', 'belly'], value: 0 }, { hidden: true });
		Flux.next('interface|led|clearLeds', { speed: 100, duration: 1.3 }, { hidden: true });
	} else {
		log.debug('No music playing');
	}
}

function playFipOrJukebox() {
	log.info('playFipOrJukebox...');
	Utils.testConnexion(function(connexion) {
		setTimeout(function() {
			if (connexion == true) {
				playFip();
			} else {
				jukebox();
			}
		}, 3000);
	});
}

const STORIES = ['stories/Donjon-De-Naheulbeuk.mp3', 'stories/Aventuriers-Du-Survivaure.mp3'];

/** Function to play a story */
function playStory(story) {
	var story;
	Flux.next('interface|tts|speak', story);
	log.debug('Play story...', story);
	var storyToPlay = Utils.searchStringInArray(story, STORIES);
	// console.log(storyToPlay);
	if (storyToPlay) {
		Utils.getMp3Duration(Odi._MP3 + storyToPlay, function(length) {
			var position = Utils.random(1, Math.floor(length / 100 * 70)); // Position up to 70% of story duration
			stop();
			Odi.run('music', 'story');
			ledFlag();
			Flux.next('interface|sound|play', { mp3: storyToPlay, position: position });
		});
	} else {
		Flux.next('interface|tts|speak', { lg: 'en', msg: 'error history' });
	}
}
