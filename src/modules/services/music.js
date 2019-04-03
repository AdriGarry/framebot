#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	RandomBox = require('randombox').RandomBox;

module.exports = {
	api: {
		full: {
			POST: [
				{ url: 'fip', flux: { id: 'service|music|fip' } },
				{ url: 'jukebox', flux: { id: 'service|music|jukebox' } },
				{ url: 'naheulbeuk', flux: { id: 'service|music|story', data: 'Naheulbeuk' } },
				{ url: 'survivaure', flux: { id: 'service|music|story', data: 'Survivaure' } }
			]
		}
	},
	cron: {
		full: [{ cron: '0 15 18 * * 1-5', flux: { id: 'service|music|fipOrJukebox' } }]
	}
};

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
		Core.error('Flux error', err);
	}
});

/** Function jukebox (repeat for one hour) */
function jukebox() {
	Core.do('interface|sound|mute', null, { log: 'trace' });
	log.info('Jukebox in loop mode !');
	Core.run('music', 'jukebox');
	repeatSong();
	Core.do('interface|sound|mute', { message: 'Auto mute jukebox !', delay: 60 * 60 });
}

var jukeboxTimeout, jukeboxRandomBox;
fs.readdir(Core._MP3 + 'jukebox', (err, files) => {
	jukeboxRandomBox = new RandomBox(files);
});

function repeatSong() {
	log.info('next song...');
	let song = jukeboxRandomBox.next();
	let ttime = new Date();
	Utils.getDuration(Core._MP3 + 'jukebox/' + song)
		.then(data => {
			Core.do('interface|sound|play', { mp3: 'jukebox/' + song, duration: data });
			jukeboxTimeout = setTimeout(function() {
				// log.INFO('Next song !!!', 'duration=' + data);
				repeatSong();
			}, data * 1000);
		})
		.catch(err => {
			Core.error('repeatSong error', err);
		});
}

/** Function to play FIP radio */
function playFip() {
	log.info('Play FIP radio...');
	if (Core.run('music') === 'fip') {
		log.info('FIP already playing');
	} else {
		Core.do('interface|sound|play', { url: 'http://chai5she.cdn.dvmr.fr/fip-midfi.mp3' });
		Core.run('music', 'fip');
		Core.do('interface|sound|mute', { message: 'Auto Mute FIP', delay: 60 * 60 });
	}
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
	let storyToPlay = Utils.searchStringInArray(story, STORIES);
	if (storyToPlay) {
		Core.do('interface|tts|speak', { lg: 'en', msg: 'story' });
		Core.run('music', 'story');
		Core.do('interface|sound|playRandom', { mp3: storyToPlay });
	} else {
		Core.do('interface|tts|speak', { lg: 'en', msg: 'error story' });
	}
}
