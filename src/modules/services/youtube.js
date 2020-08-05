#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
	// { id: 'fluxId', fn: todo }
];

Observers.attachFluxParseOptions('service', 'youtube', FLUX_PARSE_OPTIONS);

setImmediate(() => {
	// initYoutubeMp3Downloader();
	// downloadYoutubeAudio('9BhSPv7YXiA');
});

let YD;

function initYoutubeMp3Downloader() {
	let YoutubeMp3Downloader = require("youtube-mp3-downloader");

	//Configure YoutubeMp3Downloader with your settings
	YD = new YoutubeMp3Downloader({
		"ffmpegPath": Core._TMP,        // FFmpeg binary location
		"outputPath": Core._TMP,    // Output file location (default: the home directory)
		"youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
		"queueParallelism": 2,                  // Download parallelism (default: 1)
		"progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
		"allowWebm": false                      // Enable download from WebM sources (default: false)
	});
}

//9BhSPv7YXiA
function downloadYoutubeAudio(youtubeId) {
	log.test('downloadYoutubeAudio:', youtubeId);

	//Download video and save as MP3 file
	YD.download(youtubeId);

	YD.on('finished', (err, data) => {
		log.test(JSON.stringify(data));
	});

	YD.on('error', (error) => {
		log.test(error);
	});

	YD.on('progress', (progress) => {
		log.test(JSON.stringify(progress));
	});

}

