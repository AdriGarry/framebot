#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const Utils = require(Core._CORE + 'Utils.js');
const Flux = require(Core._CORE + 'Flux.js');
const RandomBox = require('randombox').RandomBox;
const fs = require('fs');
const request = require('request');
const spawn = require('child_process').spawn;

Flux.service.interaction.subscribe({
	next: flux => {
		if (flux.id == 'random') {
			randomAction();
		} else if (flux.id == 'exclamation') {
			exclamation();
		} else if (flux.id == 'weather') {
			if (flux.value == 'random') {
				if (Utils.rdm()) {
					weatherService();
				} else {
					weatherInteractiveService();
				}
			} else if (flux.value == 'interactive') {
				weatherInteractiveService();
			} else {
				weatherService();
			}
		} else if (flux.id == 'demo') {
			demo();
		} else if (flux.id == 'goToWork') {
			goToWork();
		} else if (flux.id == 'uneHeure') {
			uneHeure();
		} else if (flux.id == 'russia') {
			russia();
		} else Core.error('unmapped flux in Interfaction module', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

const RANDOM_ACTIONS = [
	// TODO a mettre dans descriptor.json
	{ id: 'interface|tts|speak', weight: 7 },
	{ id: 'service|interaction|exclamation', weight: 4 },
	{ id: 'service|time|now', weight: 1 },
	{ id: 'service|time|today', weight: 1 },
	{ id: 'service|interaction|weather', data: 'random', weight: 2 },
	{ id: 'interface|hardware|cpuTTS', weight: 1 },
	{ id: 'interface|hardware|soulTTS', weight: 3 },
	{ id: 'service|time|OdiAge', weight: 1 },
	// { id: 'service|max|blinkAllLed', weight: 3 },
	{ id: 'service|max|playOneMelody', weight: 5 },
	{ id: 'service|max|hornRdm', weight: 5 }
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

var actionRandomBox = new RandomBox(randomActionList);

/** Function random action (exclamation, random TTS, time, day, weather...) */
function randomAction() {
	// var action = Utils.randomItem(randomActionList);
	var action = actionRandomBox.next();
	try {
		log.info('randomAction:', action.id, '[' + action.weight + ']');
		Flux.next(action.id, action.data);
	} catch (err) {
		Core.error('ACTION TO DEBUG =>', typeof action, action);
	}
}

var exclamationRandomBox; // = new RandomBox(EXCLAMATIONS_SOUNDS); // TODO /!\ asynchrone avec la recupération des noms de fichiers !!! (voir si d'autres cas ailleurs)
// var EXCLAMATIONS_SOUNDS;
fs.readdir(Core._MP3 + 'exclamation', (err, files) => {
	// EXCLAMATIONS_SOUNDS = files;
	exclamationRandomBox = new RandomBox(files);
	// console.log('EXCLAMATIONS_SOUNDS', EXCLAMATIONS_SOUNDS);
});
function exclamation() {
	log.info('Exclamation !');
	Flux.next('interface|led|blink', { leds: ['eye'], speed: Utils.random(40, 100), loop: 6 }, { hidden: true });
	// spawn('sh', [Core._SHELL + 'exclamation.sh']); // TODO TOTEST passer par le module sound.js
	// let exclamation = Utils.randomItem(EXCLAMATIONS_SOUNDS);
	// console.log(exclamationRandomBox.cycle);
	let exclamation = exclamationRandomBox.next();
	Flux.next('interface|sound|play', { mp3: 'exclamation/' + exclamation });
}

function uneHeure() {
	log.info('Il est 1 heure et tout va bien !');
	Flux.next('interface|sound|play', { mp3: 'system/uneHeure.mp3' });
}

function demo() {
	log.INFO('Starting Demo !');
	Core.ttsMessages.demo.forEach(tts => {
		Flux.next('interface|tts|speak', tts);
	});
}

function goToWork() {
	if (Utils.rdm()) Flux.next('interface|tts|speak', { lg: 'fr', msg: 'Go go go, allez au boulot' });
	else Flux.next('interface|tts|speak', { lg: 'fr', voice: 'espeak', msg: 'Allez allez, Maitro boulot dodo' });
}

function russia() {
	log.info('Russia !');
	Flux.next('interface|led|blink', { leds: ['eye'], speed: Utils.random(40, 100), loop: 6 }, { hidden: true });
	spawn('sh', [Core._SHELL + 'exclamation_russia.sh']);
}

var WEATHER_STATUS_LIST;
fs.readFile(Core._DATA + 'weatherStatus.json', function(err, data) {
	if (err && err.code === 'ENOENT') {
		log.debug(Core.error('No file : ' + filePath));
		callback(null);
	}
	WEATHER_STATUS_LIST = JSON.parse(data);
});

/** Function to retreive weather info */
var weatherReport = {}; //weatherData, weatherStatus, weatherTemp, wind, weatherSpeech;
function getWeatherData(callback) {
	log.debug('getWeatherData()');
	request.get(
		{
			url:
				'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20%28select%20woeid%20from%20geo.places%281%29%20where%20text%3D%22Marseille%2C%20france%22%29and%20u=%27c%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
			headers: { 'Content-Type': 'json' }
		},
		function(error, response, body) {
			try {
				if (!error && response.statusCode == 200) {
					weatherReport.data = JSON.parse(body);
					weatherReport.status = weatherReport.data.query.results.channel.item.condition.code;
					weatherReport.status = WEATHER_STATUS_LIST[weatherReport.status];
					weatherReport.temperature = weatherReport.data.query.results.channel.item.condition.temp;
					weatherReport.wind = weatherReport.data.query.results.channel.wind.speed;
					callback(weatherReport);
				} else {
					Flux.next('interface|tts|speak', { voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo' });
					Core.error("Weather request > Can't retreive weather informations. response.statusCode", response.statusCode);
					if (error) {
						Core.error('Error getting weather info  /!\\ \n' + error);
					}
				}
			} catch (e) {
				Core.error(e);
				if (Core.isAwake()) Flux.next('interface|tts|speak', { lg: 'en', msg: 'Weather error' });
			}
		}
	);
}

/** Official weather function */
function weatherService() {
	log.info('Official weather service...');
	getWeatherData(function(weatherReport) {
		var weatherSpeech = {
			voice: 'google',
			lg: 'fr',
			msg:
				'Meteo Marseille : le temps est ' +
				weatherReport.status +
				', il fait ' +
				weatherReport.temperature +
				' degres avec ' +
				(isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) +
				' kilometre heure de vent'
		};
		log.debug('weatherSpeech', weatherSpeech);
		Flux.next('interface|tts|speak', weatherSpeech);
	});
}

/** Official weather function */
function weatherInteractiveService() {
	log.info('Interactive weather service...');
	var weatherSpeech;
	getWeatherData(function(weatherReport) {
		log.debug('weatherReport', weatherReport);
		switch (Utils.random(3)) {
			case 0:
				weatherSpeech = {
					voice: 'google',
					lg: 'fr',
					msg:
						"Aujourd'hui a Marseille, il fait " +
						weatherReport.temperature +
						' degrer avec ' +
						(isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) +
						' kilometre heure de vent'
				};
				break;
			case 1:
				weatherSpeech = [
					{
						voice: 'google',
						lg: 'fr',
						msg: "Aujourd'hui a Marseille, il fait " + weatherReport.temperature + ' degrer'
					},
					{
						voice: 'espeak',
						lg: 'fr',
						msg:
							'Oui, et ' +
							(isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) +
							' kilometre heure de vent'
					},
					{ voice: 'espeak', lg: 'fr', msg: 'Un temps plutot ' + weatherReport.status }
				];
				break;
			case 2:
				weatherSpeech = [
					{ voice: 'espeak', lg: 'fr', msg: 'Hey, il fait un temp ' + weatherReport.status },
					{ voice: 'google', lg: 'fr', msg: 'Oui, il fais ' + weatherReport.temperature + ' degrer' },
					{
						voice: 'espeak',
						lg: 'fr',
						msg:
							'Oui, et ' +
							(isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) +
							' kilometre heure de vent'
					}
				];
				break;
		}
		log.debug('weatherSpeech', weatherSpeech);
		Flux.next('interface|tts|speak', weatherSpeech);
	});
}
