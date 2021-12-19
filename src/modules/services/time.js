#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [{ cron: '0 0 * * * *', flux: { id: 'service|time|now' } }]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'now', fn: now },
  { id: 'today', fn: today },
  { id: 'age', fn: ttsAge }
];

Observers.attachFluxParseOptions('service', 'time', FLUX_PARSE_OPTIONS);

/** Function TTS time now */
function now() {
  log.debug('time.now()');
  let date = new Date();
  let hour = date.getHours();
  let min = date.getMinutes();
  new Flux('interface|tts|speak', {
    lg: 'fr',
    msg: 'Il est ' + hour + ' heure ' + (min > 0 ? min : '')
  });
}

const CALENDAR = require(Core._DATA + 'calendar-fr.json');
/** Function to say current date */
function today() {
  let date = new Date();
  let dayNb = date.getDate();
  if (dayNb == 1) dayNb = 'premier';
  let day = date.getDay();
  day = CALENDAR.days[day];
  let month = date.getMonth();
  month = CALENDAR.months[month];
  let year = date.getFullYear();
  let annonceDate;

  if (Utils.rdm()) {
    annonceDate = 'Nous sommes le ' + day + ' ' + dayNb + ' ' + month + ' ' + year;
  } else {
    annonceDate = ['Nous sommes le ' + day + ' ' + dayNb + ' ' + month, "Et donc, c'est " + getSeason() + '!'];
  }

  log.debug('time.today()' + annonceDate);
  new Flux('interface|tts|speak', annonceDate);
}

function getSeason() {
  let date = new Date();
  let month_day = date.getMonth() * 100 + date.getDate();
  if (month_day < 221) {
    return "l'hiver";
  } else if (month_day < 521) {
    return 'le printemps';
  } else if (month_day < 821) {
    return "l'aitai";
  } else if (month_day < 1121) {
    return "l'automne";
  } else {
    return "l'hiver";
  }
}

/** Function to TTS age */
function ttsAge() {
  let age = Math.abs(new Date(Core.descriptor.botBirthday).getTime() - new Date());
  age = Math.ceil(age / (1000 * 3600 * 24));

  let years = Math.floor(age / 365);
  let mouths = Math.floor((age % 365) / 30);
  let rdm = ["Aujourd'hui, ", 'A ce jour', ''];
  let birthDay = rdm[Utils.random(rdm.length)];
  birthDay += "j'ai " + years + ' ans et ' + mouths + ' mois !';
  log.info("ttsAge() '" + birthDay + "'");
  new Flux('interface|tts|speak', { lg: 'fr', msg: birthDay });
}
