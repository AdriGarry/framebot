#!/usr/bin/env node
'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);


const FLUX_PARSE_OPTIONS = [
	{ set: setMoodLevel }
];

Observers.attachFluxParseOptions('service', 'mood', FLUX_PARSE_OPTIONS);

const MOOD_LEVELS = {
	0: { volume: 0 },  // muted
	1: { volume: 30 }, // system tts (including timer, and others human triggered functions)
	2: { volume: 50 }, // information tts (weather, hour, today...)
	3: { volume: 60 }, // interactive tts + exclamation sounds + max
	4: { volume: 80 }, // screen/diapo
	5: { volume: 100 } // party mode + pirate ?
};

function setMoodLevel(moodLevelId) {
	log.info('Mood level set to', moodLevelId);
	let newMoodLevel = MOOD_LEVELS[moodLevelId];
	new Flux('interface|sound|volume', newMoodLevel.volume);
}
