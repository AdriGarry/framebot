#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

Core.flux.service.maya.subscribe({
	next: flux => {
		if (flux.id == 'randomPositionSong') {
			randomPositionSong(flux.value);
			// } else if (flux.id == '') {
		} else Core.error('unmapped flux in Maya service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

// Core.do('service|music|stop');
// Core.run('music', 'story');
// ledFlag();

function randomPositionSong(error) {
	Utils.getMp3Duration(Core._MP3 + storyToPlay, function(length) {
		log.debug();
		var position = Utils.random(1, Math.floor((length / 100) * 70)); // Position up to 70% of story duration
		Core.do('service|music|stop');
		Core.run('music', 'song');
		ledFlag();
		Core.do('interface|sound|play', { mp3: storyToPlay, position: position });
	});
}
