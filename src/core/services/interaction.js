#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');
const fs = require('fs'),
	request = require('request');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	RandomBox = require('randombox').RandomBox;

Core.flux.service.interaction.subscribe({
	next: flux => {
		if (flux.id == 'random') {
			randomAction();
		} else if (flux.id == 'exclamation') {
			exclamation();
		} else if (flux.id == 'demo') {
			demo();
		} else if (flux.id == 'goToWork') {
			goToWorkTTS();
		} else if (flux.id == 'baluchon') {
			baluchonTTS();
		} else if (flux.id == 'uneHeure') {
			uneHeure();
		} else if (flux.id == 'russia') {
			russia();
		} else Core.error('unmapped flux in Interfaction module', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {});

const RANDOM_ACTIONS = [
	// TODO a mettre dans descriptor.json
	{
		id: 'interface|tts|speak',
		weight: 7
	},
	{
		id: 'service|interaction|exclamation',
		weight: 4
	},
	{
		id: 'service|time|now',
		weight: 1
	},
	{
		id: 'service|time|today',
		weight: 1
	},
	{
		id: 'service|weather|random',
		weight: 3
	},
	{
		id: 'service|weather|astronomy',
		weight: 3
	},
	{
		id: 'interface|hardware|cpuTTS',
		weight: 1
	},
	{
		id: 'service|time|age',
		weight: 1
	},
	// { id: 'service|max|blinkAllLed', weight: 3 },
	{
		id: 'service|max|playOneMelody',
		weight: 5
	},
	{
		id: 'service|max|hornRdm',
		weight: 5
	}
];

/** Building randomActionList from RANDOM_ACTIONS */
var randomActionList = [];
for (var i = 0; i < RANDOM_ACTIONS.length; i++) {
	var loop = RANDOM_ACTIONS[i].weight;
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
	var action = actionRandomBox.next();
	try {
		log.info('randomAction:', action.id, '[' + action.weight + ']');
		Core.do(action.id, action.data);
	} catch (err) {
		Core.error('ACTION TO DEBUG =>', typeof action, action);
	}
}

function exclamation() {
	log.info('Exclamation !');
	Core.do(
		'interface|led|blink',
		{
			leds: ['eye'],
			speed: Utils.random(40, 100),
			loop: 6
		},
		{
			log: 'trace'
		}
	);
	let exclamation = exclamationRandomBox.next();
	Core.do('interface|sound|play', {
		mp3: 'exclamation/' + exclamation
	});
}

function russia() {
	log.info('Russia !');
	Core.do(
		'interface|led|blink',
		{
			leds: ['eye'],
			speed: Utils.random(40, 100),
			loop: 6
		},
		{
			log: 'trace'
		}
	);
	// spawn('sh', [Core._SHELL + 'exclamation_russia.sh']);
	let russiaExclamation = russiaExclamationRandomBox.next();
	Core.do('interface|sound|play', {
		mp3: 'exclamation_russia/' + russiaExclamation
	});
}

function uneHeure() {
	log.info('Il est 1 heure et tout va bien !');
	Core.do('interface|sound|play', {
		mp3: 'system/uneHeure.mp3'
	});
}

function demo() {
	log.INFO('Starting Demo !');
	Core.ttsMessages.demo.forEach(tts => {
		Core.do('interface|tts|speak', tts);
	});
}

const BALUCHON_MSG = [
	[
		{ voice: 'espeak', msg: 'Je crois quil faut lancer lopairation baluchon' },
		{ voice: 'pico', msg: 'Sans oublier la gamelle' }
	],
	[{ voice: 'pico', msg: 'il faut lancer loperation baluchon !' }, { voice: 'pico', msg: "Et aussi la gamelle d'eau" }]
];
function baluchonTTS() {
	let tts = Utils.randomItem(BALUCHON_MSG);
	log.debug('baluchonTTS', tts);
	Core.do('interface|tts|speak', tts);
}

const GO_TO_WORK_TTS = [
	{ msg: 'Allez, bonne journée !' },
	{ msg: 'Go go go, allez au boulot' },
	{ msg: 'Allez allez, Maitro boulot dodo' }
];
function goToWorkTTS() {
	let tts = Utils.randomItem(GO_TO_WORK_TTS);
	log.debug('goToWorkTTS', tts);
	Core.do('interface|tts|speak', tts);
}
