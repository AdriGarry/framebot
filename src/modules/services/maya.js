#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'bonneNuit', fn: bonneNuit },
	{ id: 'animals', fn: animals },
	{ id: 'playlist', fn: playlistMaya }
];

Observers.attachFluxParseOptions('service', 'maya', FLUX_PARSE_OPTIONS);

const ANIMALS_SOUNDS = 'maya/animalsSounds.mp3';
function animals() {
	let songPath = Utils.getAbsolutePath(ANIMALS_SOUNDS, Core._MP3);
	if (!songPath) {
		Core.error("Can't play animals:", songPath);
		return;
	}
	new Flux('interface|sound|mute', null, { log: 'trace' });
	Core.run('music', 'animals');
	new Flux('interface|sound|play', { mp3: songPath }, { delay: 0.5 });
}

function bonneNuit() {
	new Flux([
		{ id: 'interface|tts|speak', data: { msg: 'Bonne nuit ma ya' } },
		{ id: 'interface|tts|speak', data: { voice: 'google', msg: 'Oui, fais de beaux raives !' } },
		{ id: 'interface|tts|speak', data: { voice: 'pico', msg: 'Et à demain!' } }
	]);
}

function playlistMaya() {
	new Flux({ id: 'interface|sound|play', data: { mp3: 'maya/playlist.mp3' } });
}
