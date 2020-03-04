#!/usr/bin/env node
'use strict';

const fs = require('fs');

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const RandomBox = require('randombox').RandomBox;

module.exports = {
	cron: {
		full: [{ cron: '0 15 18 * * 1-5', flux: { id: 'service|music|radio' } }]
	}
};

const FLUX_PARSE_OPTIONS = [
	{ id: 'playlist', fn: playlist },
	{ id: 'radio', fn: playRadio },
	{ id: 'story', fn: playStory },
	{ id: 'stop', fn: stop }
];

Observers.attachFluxParseOptions('service', 'music', FLUX_PARSE_OPTIONS);

const AUTO_MUTE_TIMEOUT = 60 * 60;

const RADIO_LIST = {
	fip: { id: 'fip', url: 'http://icecast.radiofrance.fr/fip-midfi.mp3' },
	bam: { id: 'bam', url: 'http://176.175.17.23:8001/;?type=http&nocache=33' }
};

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
	new Flux('interface|sound|mute', null, { log: 'trace' });
	if (typeof playlistId !== 'string' || !Utils.searchStringInArray(playlistId, Object.keys(PLAYLIST))) {
		log.info("Playlist id '" + playlistId + "' not reconized, fallback to default playlist.");
		playlistId = 'jukebox';
	}
	log.info(`Playlist ${playlistId} in loop mode !`);
	Core.run('music', playlistId);
	new Flux('interface|sound|mute', { message: 'Auto mute jukebox!', delay: AUTO_MUTE_TIMEOUT });
	setTimeout(() => {
		repeatSong(PLAYLIST[playlistId]);
	}, 1000);
}

function repeatSong(playlist) {
	let song = playlist.randomBox.next();
	log.info('Playlist ' + playlist.id + ' next song:', song);
	Utils.getDuration(playlist.path + song)
		.then(data => {
			new Flux('interface|sound|play', { mp3: playlist.path + song, duration: data });
			playlist.timeout = setTimeout(function() {
				// log.INFO('Next song !!!', 'duration=' + data);
				repeatSong(playlist);
			}, data * 1000);
		})
		.catch(err => {
			Core.error('repeatSong error', err);
		});
}

/** Function to play radio */
function playRadio(radioId) {
	Utils.testConnection()
		.then(() => {
			if (Core.run('music') && Core.run('music') === radioId) {
				log.info('Already playing radio', Core.run('music'));
				return;
			}
			new Flux('interface|sound|mute', null, { log: 'trace' });
			let radio;
			if (radioId && RADIO_LIST.hasOwnProperty(radioId)) {
				radio = RADIO_LIST[radioId];
			} else {
				log.info("Radio id '" + radioId + "' not reconized, fallback to default radio.");
				radio = RADIO_LIST.fip;
			}
			log.info('Play radio ' + radio.id);
			new Flux('interface|tts|speak', radio.id + ' radio');

			new Flux('interface|sound|play', { url: radio.url }, { delay: 2 });
			Core.run('music', radio.id);
			new Flux('interface|sound|mute', { message: 'Auto Mute radio!', delay: AUTO_MUTE_TIMEOUT });
		})
		.catch(() => {
			log.info('No internet connexion, falling back to jukebox');
			playlist();
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
		new Flux('interface|tts|speak', { lg: 'en', msg: 'story' });
		Core.run('music', 'story');
		new Flux('interface|sound|playRandom', { mp3: storyToPlay });
	} else {
		new Flux('interface|tts|speak', { lg: 'en', msg: 'error story' });
	}
}
