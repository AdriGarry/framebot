#!/usr/bin/env node

'use strict';

const fs = require('fs'),
	weather = require('weather-js');

const Core = require('./../../core/Core').Core;

const { Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'refresh', fn: fetchWeatherData },
	{ id: 'report', fn: reportTTS },
	{ id: 'alternative', fn: alternativeReportTTS },
	{ id: 'random', fn: randomTTS }
];

Observers.attachFluxParseOptions('service', 'weather', FLUX_PARSE_OPTIONS);

const FETCH_WEATHER_DATA_DELAY = Core.isAwake() ? 60 : 300;

var WEATHER_STATUS_LIST;
fs.readFile(Core._DATA + 'weatherStatus.json', function (err, data) {
	if (err && err.code === 'ENOENT') {
		log.debug(Core.error('No file : ' + filePath));
	}
	WEATHER_STATUS_LIST = JSON.parse(data);

	fetchWeatherData();
	setInterval(() => {
		fetchWeatherData();
	}, FETCH_WEATHER_DATA_DELAY * 60 * 1000);
});

function randomTTS() {
	if (Utils.rdm()) {
		reportTTS();
	} else {
		alternativeReportTTS();
	}
}

/** Official weather function */
function reportTTS() {
	log.info('Weather report...');
	fetchWeatherData()
		.then(() => {
			let weatherSpeech = {
				voice: 'google',
				lg: 'fr',
				msg:
					'Meteo Marseille : le temps est ' +
					weatherReport.status.label +
					', il fait ' +
					weatherReport.temperature +
					' degres avec ' +
					(isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) +
					' kilometre heure de vent'
			};
			log.debug('weatherSpeech', weatherSpeech);
			new Flux('interface|tts|speak', weatherSpeech);
		})
		.catch(err => {
			Core.error('Error weather', err);
		});
}

/** Official weather function */
function alternativeReportTTS() {
	log.info('Alternative weather report...');
	fetchWeatherData()
		.then(() => {
			log.debug('weatherReport', weatherReport);
			new Flux('interface|tts|speak', getAlternativeWeatherReport(weatherReport));
		})
		.catch(err => {
			Core.error('Error weather', err);
		});
}

var weatherReport;

function fetchWeatherData() {
	return new Promise((resolve, reject) => {
		weather.find({ search: '13001', degreeType: 'C' }, function (err, result) {
			if (err) {
				Core.error("Weather request > Can't retreive weather informations. response.statusCode", err);
				reject(err);
			} else {
				try {
					weatherReport = {};
					weatherReport.data = result[0].current;
					weatherReport.code = weatherReport.data.skycode;
					weatherReport.status = WEATHER_STATUS_LIST[weatherReport.code];
					weatherReport.temperature = weatherReport.data.temperature;
					weatherReport.wind = weatherReport.data.windspeed;

					let weatherData = weatherReport.status;
					weatherData.temperature = weatherReport.temperature;
					weatherData.code = weatherReport.code;
					Core.run('weather', weatherData);
					resolve(weatherReport);
				} catch (error) {
					log.error("Can't parse weather data");
					reject(error);
				}
			}
		});
	});
}

function getAlternativeWeatherReport(weatherReport) {
	let weatherSpeech;
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
					msg: "Aujourd'hui a Marseille, il fait " + weatherReport.temperature + ' degrer'
				},
				{
					msg:
						'Oui, et ' + (isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) + ' kilometre heure de vent'
				},
				{
					msg: 'Un temps plutot ' + weatherReport.status.label
				}
			];
			break;
		case 2:
			weatherSpeech = [
				{ msg: 'Hey, il fait un temp ' + weatherReport.status.label },
				{
					voice: 'google',
					msg: 'Oui, il fais ' + weatherReport.temperature + ' degrer'
				},
				{
					msg:
						'Oui, et ' + (isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) + ' kilometre heure de vent'
				}
			];
			break;
	}
	return weatherSpeech;
}
