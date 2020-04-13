#!/usr/bin/env node

'use strict';

const fs = require('fs');

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const RandomBox = require('randombox').RandomBox;

module.exports = {
	cron: {
		full: [
			{ cron: '0 19 19 * * *', flux: { id: 'service|interaction|baluchon' } },
			{ cron: '0 */25 9-16 1-5 * *', flux: { id: 'service|interaction|homeWork' } },
			//{ cron: '0 0 12 * * 0', flux: { id: 'service|interaction|civilHorn' } },
			{ cron: '13 0 1,13 * * *', flux: { id: 'service|interaction|uneHeure' } },
			{ cron: '13 13,25,40,51 17-21 * * *', flux: { id: 'service|interaction|random' } }
		]
	}
};

const FLUX_PARSE_OPTIONS = [
	{ id: 'random', fn: randomAction },
	{ id: 'exclamation', fn: exclamation },
	{ id: 'demo', fn: demo },
	{ id: 'goToWorkTTS', fn: goToWorkTTS },
	{ id: 'goToWorkQueue', fn: goToWorkTTSQueue },
	{ id: 'homeWork', fn: homeWork },
	{ id: 'baluchon', fn: baluchonTTS },
	{ id: 'uneHeure', fn: uneHeure },
	{ id: 'russia', fn: russia },
	{ id: 'russiaHymn', fn: russiaHymn },
	{ id: 'civilHorn', fn: civilHorn }
];

Observers.attachFluxParseOptions('service', 'interaction', FLUX_PARSE_OPTIONS);

setImmediate(() => { });

const RANDOM_ACTIONS = [
	{ id: 'interface|tts|speak', weight: 7 },
	{ id: 'service|interaction|exclamation', weight: 4 },
	{ id: 'service|time|now', weight: 1 },
	{ id: 'service|time|today', weight: 1 },
	{ id: 'service|weather|random', weight: 3 },
	{ id: 'service|weather|astronomy', weight: 3 },
	{ id: 'interface|hardware|cpuTTS', weight: 1 },
	{ id: 'service|time|age', weight: 1 },
	{ id: 'service|max|playOneMelody', weight: 5 },
	{ id: 'service|max|hornRdm', weight: 5 }
];

/** Building randomActionList from RANDOM_ACTIONS */
var randomActionList = [];
for (let i = 0; i < RANDOM_ACTIONS.length; i++) {
	let loop = RANDOM_ACTIONS[i].weight;
	while (loop) {
		randomActionList.push(RANDOM_ACTIONS[i]);
		loop--;
	}
}

var actionRandomBox = new RandomBox(randomActionList),
	exclamationRandomBox,
	russiaExclamationRandomBox;

fs.readdir(Core._MP3 + 'exclamation', (err, files) => {
	exclamationRandomBox = new RandomBox(files);
});
fs.readdir(Core._MP3 + 'exclamation_russia', (err, files) => {
	russiaExclamationRandomBox = new RandomBox(files);
});

/** Function random action (exclamation, random TTS, time, day, weather...) */
function randomAction() {
	let action = actionRandomBox.next();
	try {
		log.info('randomAction:', action.id, '[' + action.weight + ']');
		new Flux(action.id, action.data);
	} catch (err) {
		Core.error('ACTION TO DEBUG =>', typeof action, action);
	}
}

function exclamation() {
	log.info('Exclamation');
	new Flux('interface|led|blink', { leds: ['eye'], speed: Utils.random(40, 100), loop: 6 }, { log: 'trace' });
	let exclamation = exclamationRandomBox.next();
	new Flux('interface|sound|play', {
		mp3: 'exclamation/' + exclamation
	});
}

function civilHorn() {
	log.info('Civil Horn');
	new Flux('interface|led|blink', { leds: ['eye', 'belly'], speed: 90, loop: 50 }, { log: 'trace' });
	new Flux('interface|arduino|connect');
	new Flux('interface|sound|play', {
		mp3: 'civilHorn.mp3'
	});
	new Flux('service|max|hornSiren', null, { delay: 3.2 });
}

function russia() {
	log.info('Russia !');
	let russiaExclamation = russiaExclamationRandomBox.next();
	new Flux('interface|sound|play', {
		mp3: 'exclamation_russia/' + russiaExclamation
	});
}

function russiaHymn() {
	log.info('Russia Hymn!');
	new Flux('interface|sound|play', {
		mp3: 'playlists/jukebox/HymneSovietique.mp3'
	});
}

function uneHeure() {
	log.info('Il est 1 heure et tout va bien !');
	new Flux('interface|sound|play', {
		mp3: 'system/uneHeure.mp3'
	});
}

function demo() {
	log.INFO('Starting Demo !');
	Core.ttsMessages.demo.forEach(tts => {
		new Flux('interface|tts|speak', tts);
	});
}

const BALUCHON_MSG = [
	[
		{ voice: 'espeak', msg: 'Je crois quil faut lancer lopairation baluchon' },
		{ voice: 'pico', msg: 'Sans oublier la gamelle' }
	],
	[
		{ voice: 'pico', msg: 'il faut lancer loperation baluchon !' },
		{ voice: 'pico', msg: "Et aussi la gamelle d'eau" }
	]
];
function baluchonTTS() {
	let tts = Utils.randomItem(BALUCHON_MSG);
	log.debug('baluchonTTS', tts);
	new Flux('interface|tts|speak', tts);
}

const GO_TO_WORK_TTS = [
	{ msg: 'Allez, bonne journée !' },
	{ msg: 'Allez, a ce soir !' },
	{ msg: 'Go go go, allez au boulot' },
	{ msg: 'Allez allez, Maitro boulot dodo' }
];
function goToWorkTTSQueue() {
	log.debug('goToWorkTTSQueue...');
	new Flux('service|interaction|goToWorkTTS', null, { delay: 2 * 60, loop: 5 });
}

function goToWorkTTS() {
	let tts = Utils.randomItem(GO_TO_WORK_TTS);
	log.debug('goToWorkTTS', tts);
	new Flux('interface|tts|speak', tts);
}

function homeWork() {
	log.test('HOMEWORK...');
	new Flux('interface|tts|speak', 'Alors, comment ça va au travail ce matin ?');
}
