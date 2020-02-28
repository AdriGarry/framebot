#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	Observers = require(Core._CORE + 'Observers.js');

const log = new (require(Core._API + 'Logger.js'))(__filename),
	Flux = require(Core._API + 'Flux.js'),
	{ Utils } = require(Core._API + 'api.js');

module.exports = {};

Observers.service().maya.subscribe({
	next: flux => {
		if (flux.id == 'comptine') {
			comptine(); // Deprecated... to delete ?
			// } else if (flux.id == '') {
		} else if (flux.id == 'bonneNuit') {
			bonneNuit();
		} else if (flux.id == 'animals') {
			animals();
		} else if (flux.id == 'lePetitVer') {
			lePetitVer();
		} else Core.error('unmapped flux in Maya service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

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
