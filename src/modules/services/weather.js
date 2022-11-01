#!/usr/bin/env node

'use strict';

const fs = require('fs'),
  weather = require('weather-js');

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

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

let WEATHER_STATUS_LIST;

setTimeout(function () {
  initWeatherService();
}, 30 * 1000);

function initWeatherService() {
  log.info('init weather service...');
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
}

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
  fetchWeatherData().then(() => {
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
  });
}

/** Official weather function */
function alternativeReportTTS() {
  log.info('Alternative weather report...');
  fetchWeatherData().then(() => {
    log.debug('weatherReport', weatherReport);
    new Flux('interface|tts|speak', getAlternativeWeatherReport(weatherReport));
  });
}

let weatherReport;

function fetchWeatherData() {
  return new Promise((resolve, reject) => {
    weather.find({ search: '13001', degreeType: 'C' }, function (err, result) {
      if (err) {
        log.error("Weather request > Can't retreive weather informations.", err.code);
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

function getAlternativeWeatherReport(weatherReportData) {
  return Utils.rdm()
    ? [
        {
          voice: 'google',
          lg: 'fr',
          msg:
            "Aujourd'hui a Marseille, il fait " +
            weatherReportData.temperature +
            ' degrer avec ' +
            (isNaN(weatherReportData.wind) ? '0' : Math.round(weatherReportData.wind)) +
            ' kilometre heure de vent'
        }
      ]
    : [
        {
          voice: 'google',
          msg: "Aujourd'hui a Marseille, il fait " + weatherReportData.temperature + ' degrer'
        },
        {
          msg: 'Oui, et ' + (isNaN(weatherReportData.wind) ? '0' : Math.round(weatherReportData.wind)) + ' kilometre heure de vent'
        },
        {
          msg: 'Un temps plutot ' + weatherReportData.status.label
        }
      ];
}
