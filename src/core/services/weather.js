#!/usr/bin/env node

'use strict';

const fs = require('fs'),
	// request = require('request'),
	OAuth = require('oauth');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	WEATHER_CREDENTIALS = require(Core._SECURITY + 'credentials.json').weather;

const WEATHER_SERVICE_URL_OLD =
	'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20%28select%20woeid%20from%20geo.places%281%29%20where%20text%3D%22Marseille%2C%20france%22%29and%20u=%27c%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

const WEATHER_SERVICE_URL = 'https://weather-ydn-yql.media.yahoo.com/forecastrss?location=marseille,fr&format=json';

Core.flux.service.weather.subscribe({
	next: flux => {
		if (flux.id == 'report') {
			reportTTS();
		} else if (flux.id == 'alternative') {
			alternativeReportTTS();
		} else if (flux.id == 'random') {
			if (Utils.rdm()) {
				reportTTS();
			} else {
				alternativeReportTTS();
			}
		} else Core.error('unmapped flux in Weather module', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

setImmediate(() => {});

var WEATHER_STATUS_LIST;
fs.readFile(Core._DATA + 'weatherStatus.json', function(err, data) {
	if (err && err.code === 'ENOENT') {
		log.debug(Core.error('No file : ' + filePath));
		callback(null);
	}
	WEATHER_STATUS_LIST = JSON.parse(data);
});

/** Official weather function */
function reportTTS() {
	log.info('Weather report...');
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
		Core.do('interface|tts|speak', weatherSpeech);
	});
}

/** Official weather function */
function alternativeReportTTS() {
	log.info('Alternative weather report...');
	var weatherSpeech;
	getWeatherData(weatherReport => {
		log.debug('weatherReport', weatherReport);
		weatherSpeech = getAlternativeWeatherReport(weatherReport);
		Core.do('interface|tts|speak', weatherSpeech);
	});
}

/** Function to retreive weather info */
const header = {
	'Yahoo-App-Id': 'iROAWW52'
};
const request = new OAuth.OAuth(
	null,
	null,
	WEATHER_CREDENTIALS.consumerKey,
	WEATHER_CREDENTIALS.consumerSecret,
	'1.0',
	null,
	'HMAC-SHA1',
	null,
	header
);
var weatherReport = {}; //weatherData, weatherStatus, weatherTemp, wind, weatherSpeech;
function getWeatherData(callback) {
	log.debug('getWeatherData()');
	request.get(WEATHER_SERVICE_URL, null, null, function(err, data, result) {
		// TODO isoler dans une fonction parseWeatherResult() ?
		if (err) {
			console.log(err);
			Core.error("Weather request > Can't retreive weather informations. response.statusCode", err);
		} else {
			console.log('data', data);
			console.log('result', result);
			try {
				weatherReport.data = JSON.parse(body);
				weatherReport.status = weatherReport.data.query.results.channel.item.condition.code;
				weatherReport.status = WEATHER_STATUS_LIST[weatherReport.status];
				weatherReport.temperature = weatherReport.data.query.results.channel.item.condition.temp;
				weatherReport.wind = weatherReport.data.query.results.channel.wind.speed;
				callback(weatherReport); // Promise ?!
			} catch (err) {
				Core.error('Error while parsing weather API response', err);
			}
		}
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
					lg: 'fr',
					msg: "Aujourd'hui a Marseille, il fait " + weatherReport.temperature + ' degrer'
				},
				{
					voice: 'espeak',
					lg: 'fr',
					msg:
						'Oui, et ' + (isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) + ' kilometre heure de vent'
				},
				{
					voice: 'espeak',
					lg: 'fr',
					msg: 'Un temps plutot ' + weatherReport.status
				}
			];
			break;
		case 2:
			weatherSpeech = [
				{
					voice: 'espeak',
					lg: 'fr',
					msg: 'Hey, il fait un temp ' + weatherReport.status
				},
				{
					voice: 'google',
					lg: 'fr',
					msg: 'Oui, il fais ' + weatherReport.temperature + ' degrer'
				},
				{
					voice: 'espeak',
					lg: 'fr',
					msg:
						'Oui, et ' + (isNaN(weatherReport.wind) ? '0' : Math.round(weatherReport.wind)) + ' kilometre heure de vent'
				}
			];
			break;
	}
	return weatherSpeech;
}
