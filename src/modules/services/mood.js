#!/usr/bin/env node
'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);


const FLUX_PARSE_OPTIONS = [
	{ id: 'set', fn: setMoodLevel, condition: { isAwake: true } },
];

Observers.attachFluxParseOptions('service', 'mood', FLUX_PARSE_OPTIONS);

const MOOD_LEVELS = {
	0: { volume: 0 },  // muted
	1: { volume: 30 }, // system tts (including timer, and others human triggered functions)
	2: { volume: 50 }, // information tts (weather, hour, today...)
	3: { volume: 60 }, // max + interactive tts + exclamation sounds
	4: { volume: 80 }, // screen/diapo
	5: { volume: 100 } // party mode + pirate ?
};

var moodLevelId = Core.run('mood');

setImmediate(() => {
	setMoodLevel(moodLevelId);
});

function setMoodLevel(newMoodLevelId) {
	log.info('Mood level set to', newMoodLevelId);
	moodLevelId = newMoodLevelId;
	new Flux('interface|sound|volume', MOOD_LEVELS[moodLevelId].volume);
	additionalMoodSetup();
}

function additionalMoodSetup() {
	// Max
	if (moodLevelId >= 3) {
		new Flux('interface|arduino|connect');
	} else if (Core.run('max')) {
		new Flux('interface|arduino|disconnect');
	}

	// HDMI (video loop)
	if (moodLevelId >= 4) {
		new Flux('interface|video|loop');
	} else if (Core.run('screen')) {
		new Flux('interface|hdmi|off');
	}
}