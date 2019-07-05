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
				{ url: 'playlist/jukebox', flux: { id: 'service|music|playlist', data: 'jukebox' } },
				{ url: 'playlist/low', flux: { id: 'service|music|playlist', data: 'low' } },
				{ url: 'playlist/comptines', flux: { id: 'service|music|playlist', data: 'comptines' } },
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
		if (flux.id == 'playlist') {
			playlist(flux.value);
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

var PLAYLIST = {
	jukebox: { id: 'jukebox', path: Core._MP3 + 'playlists/jukebox/' },
	low: { id: 'low', path: Core._MP3 + 'playlists/low/' },
	comptines: { id: 'comptines', path: Core._MP3 + 'playlists/comptines/' }
};

Object.keys(PLAYLIST).forEach(id => {
	fs.readdir(PLAYLIST[id].path, (err, files) => {
		if (err) Core.error("Can't retrieve " + id + ' songs', err);
		PLAYLIST[id].randomBox = new RandomBox(files);
	});
});

/** Function playlist (repeat for one hour) */
function playlist(playlistId) {
	Core.do('interface|sound|mute', null, { log: 'trace' });
	if (!playlistId || !Utils.searchStringInArray(playlistId, Object.keys(PLAYLIST))) {
		log.info("Playlist id '" + playlistId + "' not reconized, fallback to default playlist.");
		playlistId = 'jukebox';
	}
	log.info(`Playlist ${playlistId} in loop mode !`);
	Core.run('music', playlistId);
	Core.do('interface|sound|mute', { message: 'Auto mute jukebox !', delay: 60 * 60 });
	setTimeout(() => {
		repeatSong(PLAYLIST[playlistId]);
	}, 1000);
}

function repeatSong(playlist) {
	let song = playlist.randomBox.next();
	log.info('Playlist ' + playlist.id + ' next song:', song);
	Utils.getDuration(playlist.path + song)
		.then(data => {
			Core.do('interface|sound|play', { mp3: playlist.path + song, duration: data });
			playlist.timeout = setTimeout(function () {
				// log.INFO('Next song !!!', 'duration=' + data);
				repeatSong(playlist);
			}, data * 1000);
		})
		.catch(err => {
			Core.error('repeatSong error', err);
		});
}

/** Function to play FIP radio */
function playFip() {
	Core.do('interface|sound|mute', null, { log: 'trace' });
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
	Utils.testConnexion(function (connexion) {
		setTimeout(function () {
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
		Object.keys(PLAYLIST).forEach(id => {
			clearTimeout(PLAYLIST[id].timeout);
		});
		Core.run('music', false);
	} else {
		log.debug('Stop, but no music playing');
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
