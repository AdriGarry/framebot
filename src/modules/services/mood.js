#!/usr/bin/env node
'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

module.exports = {
	cron: {
		full: [
			{ cron: '10 0 17 * * *', flux: { id: 'service|mood|set', data: 3 } },
			{ cron: '10 0 21 * * *', flux: { id: 'service|mood|set', data: 2 } },
			{ cron: '0 59 22 * * *', flux: { id: 'service|mood|set', data: 1 } }
		]
	}
};


const FLUX_PARSE_OPTIONS = [
	{ id: 'set', fn: setMoodLevel, condition: { isAwake: true } },
];

Observers.attachFluxParseOptions('service', 'mood', FLUX_PARSE_OPTIONS);

const MOOD_LEVELS = {
	0: { volume: 0 },  // muted
	1: { volume: 30 }, // system tts: clock, and others human triggered functions (timer...)
	2: { volume: 50 },
	3: { volume: 60 }, // max + interaction
	4: { volume: 80 }, // screen/diapo
	5: { volume: 100 } // party mode + pirate
};

setImmediate(() => {
	setMoodLevel(Core.run('mood'));
});

function setMoodLevel(newMoodLevelId) {
	Core.run('mood', newMoodLevelId);
	log.info('Mood level set to', newMoodLevelId);
	new Flux('interface|sound|volume', MOOD_LEVELS[newMoodLevelId].volume);
	additionalMoodSetup(newMoodLevelId);
}

function additionalMoodSetup(moodLevelId) {
	// Max
	if (moodLevelId >= 3) {
		new Flux('interface|arduino|connect');
	} else if (Core.run('max')) {
		new Flux('interface|arduino|disconnect');
	}
	// Interaction
	if (moodLevelId >= 3) {
		scheduleFluxWhileMoodLevel(3, 20, { id: 'service|interaction|random' });
	}

	// HDMI (video loop)
	if (moodLevelId >= 4) {
		new Flux('interface|video|loop');
	} else if (Core.run('screen')) {
		new Flux('interface|hdmi|off');
	}

	// Party
	if (moodLevelId === 5) {
		new Flux('service|party|start');
		scheduleFluxWhileMoodLevel(5, 5, { id: 'service|party|pirate' });
	}
}

function scheduleFluxWhileMoodLevel(moodLevelLimit, minutesInterval, flux) {
	new Flux(flux.id, flux.data);
	let interval = setInterval(() => {
		if (Core.run('mood') >= moodLevelLimit) new Flux(flux.id, flux.data);
		else clearInterval(interval);
	}, minutesInterval * 60 * 1000);
}