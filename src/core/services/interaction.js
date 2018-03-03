#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(Odi._CORE + 'Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;

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
		} else Odi.error('unmapped flux in Exclamation module', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

var randomActionBase = [
	{ type: 'interface', subject: 'tts', id: 'speak', weight: 6 }, //7
	{ type: 'service', subject: 'interaction', id: 'exclamation', weight: 4 }, //4
	{ type: 'service', subject: 'time', id: 'now', weight: 1 },
	{ type: 'service', subject: 'time', id: 'today', weight: 1 },
	{ type: 'service', subject: 'interaction', id: 'weather', value: 'random', weight: 2 }, //4
	{ type: 'interface', subject: 'hardware', id: 'cpuTTS', weight: 1 },
	{ type: 'interface', subject: 'hardware', id: 'soulTTS', weight: 3 },
	{ type: 'service', subject: 'time', id: 'OdiAge', weight: 1 }
];
/** Building randomActionList from randomActionBase */
var randomActionList = [];
for (var i = 0; i < randomActionBase.length; i++) {
	var loop = randomActionBase[i].weight;
	while (loop) {
		randomActionList.push(randomActionBase[i]);
		loop--;
	}
}

// Lancer les anniversaires d'ici ? (ou alors dans un calendar.js ?)

/** Function random action (exclamation, random TTS, time, day, weather...) */
function randomAction() {
	// var action = randomActionList[Utils.random(randomActionList.length)];
	var action = Utils.randomItem(randomActionList);
	// log.INFO('heyheyhey==>', action);
	log.info('randomAction:', action.id, '[' + action.weight + ']');
	Flux.next(action.type, action.subject, action.id, action.value);
}

function exclamation() {
	log.info('Exclamation !');
	Flux.next('interface', 'led', 'blink', { leds: ['eye'], speed: Utils.random(40, 100), loop: 6 }, null, null, true);
	spawn('sh', [Odi._SHELL + 'exclamation.sh']); // TODO passer par le module sound.js
}

function uneHeure() {
	log.info('Il est 1 heure et tout va bien !');
	Flux.next('interface', 'sound', 'play', { mp3: 'system/uneHeure.mp3' });
}

function demo() {
	log.INFO('Starting Demo !');
	Odi.ttsMessages.demo.forEach(tts => {
		Flux.next('interface', 'tts', 'speak', tts);
	});
}

function goToWork() {
	if (Utils.rdm()) Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: 'Go go go, allez au boulot' });
	else Flux.next('interface', 'tts', 'speak', { lg: 'fr', voice: 'espeak', msg: 'Allez allez, Maitro boulot dodo' });
}

function russia() {
	log.info('Russia !');
	Flux.next('interface', 'led', 'blink', { leds: ['eye'], speed: Utils.random(40, 100), loop: 6 }, null, null, true);
	spawn('sh', [Odi._SHELL + 'exclamation_russia.sh']);
}

var WEATHER_STATUS_LIST;
fs.readFile(Odi._DATA + 'weatherStatus.json', function(err, data) {
	if (err && err.code === 'ENOENT') {
		log.debug(Odi.error('No file : ' + filePath));
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
					Flux.next('interface', 'tts', 'speak', { voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo' });
					Odi.error("Weather request > Can't retreive weather informations. response.statusCode", response.statusCode);
					if (error) {
						Odi.error('Error getting weather info  /!\\ \n' + error);
					}
				}
			} catch (e) {
				if (Odi.isAwake()) Flux.next('interface', 'tts', 'speak', { lg: 'en', msg: 'Weather error' });
				Odi.error(e);
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
		Flux.next('interface', 'tts', 'speak', weatherSpeech);
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
		Flux.next('interface', 'tts', 'speak', weatherSpeech);
	});
}
