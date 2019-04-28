#!/usr/bin/env node

'use strict';
const fs = require('fs');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	RandomBox = require('randombox').RandomBox;

module.exports = {
	api: {
		full: {
			POST: [
				{ url: 'maya/comptine', flux: { id: 'service|maya|comptine' } },
				{ url: 'maya/songs', flux: { id: 'service|maya|songs' } },
				{ url: 'maya/lePetitVer', flux: { id: 'interface|sound|play', data: { mp3: 'maya/songs/lePetitVer.mp3' } } },
				{
					url: 'maya/goodNight',
					flux: [
						{ id: 'interface|tts|speak', data: { voice: 'google', msg: 'Bonne nuit Maya' } },
						{ id: 'interface|tts|speak', data: 'Oui, fais de beaux raives !' }
					]
				}
			]
		}
	}
};

Core.flux.service.maya.subscribe({
	next: flux => {
		if (flux.id == 'comptine') {
			comptine(flux.value);
		} else if (flux.id == 'songs') {
			songs(flux.value);
		} else Core.error('unmapped flux in Maya service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

var comptineTimeout, comptimeRandomBox;
fs.readdir(Core._MP3 + 'comptines', (err, files) => {
	comptimeRandomBox = new RandomBox(files);
});

/** Function comptine (repeat for one hour) */
function comptine() {
	Core.do('interface|sound|mute', null, { log: 'trace' });
	log.info('Jukebox in loop mode !');
	Core.run('music', 'comptines');
	repeatSong();
	Core.do('interface|sound|mute', { message: 'Auto mute jukebox!', delay: 60 * 60 });
}

function repeatSong() {
	log.info('next comptine...');
	let song = comptimeRandomBox.next();
	Utils.getDuration(Core._MP3 + 'comptines/' + song)
		.then(data => {
			Core.do('interface|sound|play', { mp3: 'comptines/' + song, duration: data });
			comptineTimeout = setTimeout(function() {
				// log.INFO('Next song !!!', 'duration=' + data);
				repeatSong();
			}, data * 1000);
		})
		.catch(err => {
			Core.error('repeatSong error', err);
		});
}

const SONGS = 'maya/songs/comptines.mp3';
function songs() {
	let songPath = Utils.getAbsolutePath(SONGS, Core._MP3);
	if (!songPath) {
		Core.error("Can't play songs");
		return;
	}
	Core.do('interface|sound|mute', null, { log: 'trace' });
	Core.run('music', 'mayaSongs');
	Core.do('interface|sound|playRandom', { mp3: songPath }, { delay: 0.5 });
}
