#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {};

Core.flux.service.maya.subscribe({
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
	Core.do('interface|sound|mute', null, { log: 'trace' });
	Core.run('music', 'comptines');
	Core.do('interface|sound|playRandom', { mp3: songPath }, { delay: 0.5 });
}

const ANIMALS_SOUNDS = 'maya/animalsSounds.mp3';
function animals() {
	let songPath = Utils.getAbsolutePath(ANIMALS_SOUNDS, Core._MP3);
	if (!songPath) {
		Core.error("Can't play animals:", songPath);
		return;
	}
	Core.do('interface|sound|mute', null, { log: 'trace' });
	Core.run('music', 'animals');
	Core.do('interface|sound|play', { mp3: songPath }, { delay: 0.5 });
}

function bonneNuit() {
	Core.do([
		{ id: 'interface|tts|speak', data: { msg: 'Bonne nuit ma ya' } },
		{ id: 'interface|tts|speak', data: { voice: 'google', msg: 'Oui, fais de beaux raives !' } },
		{ id: 'interface|tts|speak', data: { voice: 'pico', msg: 'Et à demain!' } }
	]);
}

function lePetitVer() {
	Core.do({ id: 'interface|sound|play', data: { mp3: 'maya/songs/lePetitVer.mp3' } });
}
