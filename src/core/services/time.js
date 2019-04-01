#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

module.exports = {
	api: {
		full: {
			POST: [
				{ url: 'time', flux: { id: 'service|time|now' } },
				{ url: 'date', flux: { id: 'service|time|today' } },
				{ url: 'age', flux: { id: 'service|time|age' } },
				{ url: 'birthdaySong', flux: { id: 'service|time|birthday' } }
			]
		}
	},
	cron: {
		full: [{ cron: '0 0 * * * *', flux: { id: 'service|time|now' } }]
	}
};

Core.flux.service.time.subscribe({
	next: flux => {
		if (flux.id == 'now') {
			now();
		} else if (flux.id == 'today') {
			today();
		} else if (flux.id == 'age') {
			ttsAge();
		} else if (flux.id == 'birthday') {
			birthdaySong();
		} else Core.error('unmapped flux in Time service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

/** Function TTS time now */
function now() {
	log.debug('time.now()');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	Core.do('interface|tts|speak', {
		lg: 'fr',
		msg: 'Il est ' + hour + ' heure ' + (min > 0 ? min : '')
	});
}

const CALENDAR = require(Core._DATA + 'calendar.json');
/** Function to say current date */
function today() {
	var date = new Date();
	var dayNb = date.getDate();
	if (dayNb == 1) dayNb = 'premier';
	var day = date.getDay();
	var day = CALENDAR.days[day];
	var month = date.getMonth();
	var month = CALENDAR.months[month];
	var year = date.getFullYear();

	if (Utils.rdm()) {
		var annonceDate = 'Nous sommes le ' + day + ' ' + dayNb + ' ' + month + ' ' + year;
	} else {
		var annonceDate = ['Nous sommes le ' + day + ' ' + dayNb + ' ' + month, "Et donc, c'est " + getSeason() + '!'];
	}

	log.debug('time.today()' + annonceDate);
	// Core.do('interface|tts|speak', { lg: 'fr', msg: annonceDate });
	Core.do('interface|tts|speak', annonceDate);
}

function getSeason() {
	var date = new Date();
	var month_day = date.getMonth() * 100 + date.getDate();
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
	var age = Math.abs(new Date(Core.descriptor.botBirthday).getTime() - new Date());
	age = Math.ceil(age / (1000 * 3600 * 24));

	var years = Math.floor(age / 365);
	var mouths = Math.floor((age % 365) / 30);
	var rdm = ["Aujourd'hui, ", 'A ce jour', ''];
	var birthDay = rdm[Utils.random(rdm.length)];
	birthDay += "j'ai " + years + ' ans et ' + mouths + ' mois !';
	log.info("ttsAge() '" + birthDay + "'");
	Core.do('interface|tts|speak', {
		lg: 'fr',
		msg: birthDay
	});
}

function birthdaySong() {
	log.info('birthday song...');
	Core.do('interface|sound|play', {
		mp3: 'system/birthday.mp3'
	});
}
