#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	RandomBox = require('randombox').RandomBox;

Core.flux.service.music.subscribe({
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
		} else Core.error('unmapped flux in Music service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

/** Function jukebox (repeat for one hour) */
function jukebox() {
	Core.do('interface|sound|mute', null, { hidden: true });
	log.info('Jukebox in loop mode !');
	Core.run('music', 'jukebox');
	repeatSong();
	Core.do('interface|sound|mute', { message: 'Auto mute jukebox !', delay: 2 }, { delay: 60 * 60 });
}

var jukeboxTimeout, jukeboxRandomBox;
fs.readdir(Core._MP3 + 'jukebox', (err, files) => {
	jukeboxRandomBox = new RandomBox(files);
});

function repeatSong() {
	log.info('next song...');
	let song = jukeboxRandomBox.next();
	let ttime = new Date();
	Utils.getMp3Duration(Core._MP3 + 'jukebox/' + song, function(duration) {
		// log.INFO('duration=' + duration);
		Core.do('interface|sound|play', { mp3: 'jukebox/' + song, duration: duration });
		jukeboxTimeout = setTimeout(function() {
			// log.INFO('Next song !!!', 'duration=' + duration);
			repeatSong();
		}, duration * 1000);
	});
}

/** Function to play FIP radio */
function playFip() {
	Core.do('interface|sound|mute', null, { hidden: true });
	log.info('Play FIP radio...');
	Core.do('interface|sound|play', { url: 'http://chai5she.cdn.dvmr.fr/fip-midfi.mp3' });
	Core.run('music', 'fip');
	Core.do('interface|sound|mute', { message: 'Auto Mute FIP', delay: 2 }, { delay: 60 * 60 });
}

/** Function to play FIP radio or jukebox if no connexion */
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

/** Function to stop music timeout */
function stop() {
	if (Core.run('music')) {
		log.debug('Stop music');
		clearTimeout(jukeboxTimeout);
		Core.run('music', false);
	} else {
		log.debug('No music playing');
	}
}
/** Function to play a story */
const STORIES = ['stories/Donjon-De-Naheulbeuk.mp3', 'stories/Aventuriers-Du-Survivaure.mp3'];
function playStory(story) {
	log.debug('Play story...', story);
	let storyToPlay = Utils.searchStringInArray(story, STORIES);
	if (storyToPlay) {
		Core.do('interface|sound|mute', null, { hidden: true });
		Core.do('interface|tts|speak', { lg: 'en', msg: 'story' });
		Core.run('music', 'story');
		Core.do('interface|sound|playRandom', { mp3: storyToPlay });
	} else {
		Core.do('interface|tts|speak', { lg: 'en', msg: 'error story' });
	}
}
