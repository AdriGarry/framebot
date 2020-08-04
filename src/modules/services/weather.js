#!/usr/bin/env node

'use strict';

const fs = require('fs'),
	OAuth = require('oauth');

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const WEATHER_CREDENTIALS = require(Core._SECURITY + 'credentials.json').weather;

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'refresh', fn: fetchWeatherData },
	{ id: 'report', fn: reportTTS },
	{ id: 'alternative', fn: alternativeReportTTS },
	{ id: 'random', fn: randomTTS },
	{ id: 'astronomy', fn: astronomyTTS }
];

Observers.attachFluxParseOptions('service', 'weather', FLUX_PARSE_OPTIONS);

const WEATHER_SERVICE_URL = 'https://weather-ydn-yql.media.yahoo.com/forecastrss?location=marseille,fr&u=c&format=json';
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

/** Function to retreive weather info */
const REQUEST = new OAuth.OAuth(
	null,
	null,
	WEATHER_CREDENTIALS.consumerKey,
	WEATHER_CREDENTIALS.consumerSecret,
	'1.0',
	null,
	'HMAC-SHA1',
	null,
	{
		'Yahoo-App-Id': WEATHER_CREDENTIALS['Yahoo-App-Id']
	}
);

const DAY_FOR_ASTRONOMY = 'December 17, 1995 ';
var weatherReport;

function astronomyTTS() {
	if (!weatherReport) {
		new Flux('interface|tts|speak', [
			{ msg: "Aujourd'hui, le soleil se laive a lest" },
			{ msg: 'Et se couche a louest' }
		]);
	} else {
		let ttsSunrise =
			"Aujourd'hui, le soleil se laive a " +
			weatherReport.sunrise.getHours() +
			' heure ' +
			weatherReport.sunrise.getMinutes();
		new Flux('interface|tts|speak', ttsSunrise);
		let ttsSunset =
			'Et il se couchera a ' + weatherReport.sunset.getHours() + ' heure ' + weatherReport.sunset.getMinutes();
		new Flux('interface|tts|speak', ttsSunset);
	}
}

function fetchWeatherData() {
	log.debug('fetchWeatherData()');
	return new Promise((resolve, reject) => {
		REQUEST.get(WEATHER_SERVICE_URL, null, null, function (err, data, result) {
			if (err) {
				// Core.error("Weather request > Can't retreive weather informations. response.statusCode", err);
				reject(err);
			} else {
				try {
					weatherReport = {}; //weatherData, weatherStatus, weatherTemp, wind, weatherSpeech... add astronomy!
					weatherReport.data = JSON.parse(data);
					// "current_observation":{
					// 	"astronomy":{
					// 		"sunrise":"8:00 am",
					// 		"sunset":"5:42 pm"
					// 	},
					// }
					log.debug(weatherReport.data.current_observation.astronomy);
					weatherReport.code = weatherReport.data.current_observation.condition.code;
					weatherReport.status = WEATHER_STATUS_LIST[weatherReport.code];
					weatherReport.temperature = weatherReport.data.current_observation.condition.temperature;
					weatherReport.wind = weatherReport.data.current_observation.wind.speed;
					weatherReport.sunrise = new Date(
						DAY_FOR_ASTRONOMY + weatherReport.data.current_observation.astronomy.sunrise
					);
					weatherReport.sunset = new Date(DAY_FOR_ASTRONOMY + weatherReport.data.current_observation.astronomy.sunset);

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
