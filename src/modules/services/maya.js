#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core;

const log = new (require('./../../api/Logger'))(__filename),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'comptine', fn: comptine }, // TODO Deprecated? to delete?
	{ id: 'bonneNuit', fn: bonneNuit },
	{ id: 'animals', fn: animals },
	{ id: 'lePetitVer', fn: lePetitVer }
];

Observers.attachFluxParseOptions('service', 'maya', FLUX_PARSE_OPTIONS);

const COMPTINE = 'maya/songs/comptines.mp3';
function comptine() {
	// Deprecated... to delete ?
	let songPath = Utils.getAbsolutePath(COMPTINE, Core._MP3);
	if (!songPath) {
		Core.error("Can't play comptine:", songPath);
		return;
	}
	new Flux('interface|sound|mute', null, { log: 'trace' });
	Core.run('music', 'comptines');
	new Flux('interface|sound|playRandom', { mp3: songPath }, { delay: 0.5 });
}

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

function lePetitVer() {
	new Flux({ id: 'interface|sound|play', data: { mp3: 'maya/songs/lePetitVer.mp3' } });
}
