#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;

Flux.service.time.subscribe({
	next: flux => {
		if (flux.id == 'now') {
			now();
		} else if (flux.id == 'today') {
			today();
		} else if (flux.id == 'cocorico') {
			// cocorico(flux.value);
		} else if (flux.id == 'setAlarm') {
			setAlarm(flux.value);
		} else if (flux.id == 'alarmOff') {
			disableAllAlarms(flux.value);
		} else if (flux.id == 'isAlarm') {
			isAlarm();
		} else if (flux.id == 'birthday') {
			birthdaySong();
		} else if (flux.id == 'OdiAge') {
			sayOdiAge();
		} else if (flux.id == 'timer') {
			if (flux.value == 'stop') {
				stopTimer();
			} else setTimer(flux.value);
		} else Odi.error('unmapped flux in Time service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function TTS time now */
function now() {
	// TODO  prendre en compte le parametre voix (créer un objet tts avant de le passer en parametre)
	log.debug('time.now()');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: 'Il est ' + hour + ' heure ' + (min > 0 ? min : '') });
}

const CALENDAR = require(Odi._DATA + 'calendar.json');
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
	// Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: annonceDate });
	Flux.next('interface', 'tts', 'speak', annonceDate);
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

/** Function to disable all Odi's alarms */
function disableAllAlarms() {
	Flux.next('interface', 'tts', 'speak', 'Annulation de toutes les alarmes');
	Flux.next('interface', 'runtime', 'updateRestart', { alarms: { weekDay: null, weekEnd: null } }, 4);
}

/** Function to set Odi's custom alarm */
function setAlarm(alarm) {
	var newAlarms = {};
	Object.keys(Odi.conf('alarms')).forEach(function(key, index) {
		if (key == alarm.when) {
			newAlarms[key] = {
				h: alarm.h,
				m: alarm.m
			};
			log.info('>> ' + alarm.when + ' alarm set to ' + alarm.h + '.' + alarm.m);
		} else {
			newAlarms[key] = Odi.conf('alarms.' + key);
		}
	});
	let alarmMode = alarm.when == 'weekDay' ? 'semaine' : 'weekend';
	let alarmTTS = 'Alarme ' + alarmMode + ' reprogramer a ' + alarm.h + ' heures et ' + alarm.m + ' minutes';
	Flux.next('interface', 'tts', 'speak', alarmTTS);
	Flux.next('interface', 'runtime', 'updateRestart', { alarms: newAlarms }, 6);
}

/** Function to test if alarm now */
const WEEK_DAYS = [1, 2, 3, 4, 5];
// const weekEnd = [0, 6];
function isAlarm() {
	let now = new Date(),
		d = now.getDay(),
		h = now.getHours(),
		m = now.getMinutes(),
		alarmType = WEEK_DAYS.includes(d) ? 'weekDay' : 'weekEnd',
		alarms = Odi.conf('alarms');

	if (alarms[alarmType]) {
		if (h == alarms[alarmType].h && m == alarms[alarmType].m) {
			log.INFO('alarm time...', alarms[alarmType].h + ':' + alarms[alarmType].m);
			Odi.run('alarm', true);
			if (!Odi.isAwake()) {
				log.INFO('Alarm... wake up !!');
				Flux.next('service', 'system', 'restart');
			} else {
				cocorico();
			}
		}
	}
}

/** Function alarm part 1 */
function cocorico(mode) {
	var alarmDelay = 1;
	if (!mode || mode == 'sea') {
		// TODO remove sea mode information
		log.info('Morning Sea...');
		spawn('sh', [Odi._SHELL + 'sounds.sh', 'MorningSea']);
		Utils.getMp3Duration(Odi._MP3 + 'system/morningSea.mp3', function(seaDuration) {
			log.debug('seaDuration', seaDuration);
			alarmDelay = seaDuration * 1000;
			setTimeout(function() {
				cocoricoPart2(mode);
			}, alarmDelay);
		});
	} else {
		cocoricoPart2(mode);
	}
}

/** Function alarm part 2 */
function cocoricoPart2(mode) {
	log.INFO('cocorico !!', mode || '');
	Flux.next('interface', 'arduino', 'write', 'playHornDoUp');
	spawn('sh', [Odi._SHELL + 'sounds.sh', 'cocorico']);
	if (isBirthday()) {
		birthdaySong();
		setTimeout(function() {
			cocoricoPart3();
		}, 53 * 1000);
	} else {
		cocoricoPart3();
	}
}

/** Function alarm part 3 */
function cocoricoPart3() {
	Flux.next('service', 'time', 'now', null, 3);
	Flux.next('service', 'time', 'today', null, 5);
	Flux.next('service', 'interaction', 'weather', null, 8);
	Flux.next('service', 'voicemail', 'check', null, 13);

	Flux.next('service', 'music', 'fip', null, 45);

	var baluchonTTS = "Je crois qu'il faut lancer l'opairation baluchon";
	Flux.next('interface', 'tts', 'speak', baluchonTTS, Utils.random(15, 25) * 60, 3);
}

const BIRTHDAYS = ['17/04', '13/12'];
function isBirthday() {
	log.info('isBirthday');
	var today = { date: new Date() };
	today.day = today.date.getDate();
	today.month = today.date.getMonth() + 1;
	for (var i = 0; i < BIRTHDAYS.length; i++) {
		var splited = BIRTHDAYS[i].split('/');
		if (today.day == splited[0] && today.month == splited[1]) {
			return true;
		}
	}
	return false;
}

function birthdaySong() {
	log.info('birthday song...');
	spawn('sh', [Odi._SHELL + 'sounds.sh', 'birthday']);
}

/** Function to TTS Odi's age */
const DATE_BIRTH = new Date('August 9, 2015 00:00:00');
function sayOdiAge() {
	var age = Math.abs(DATE_BIRTH.getTime() - new Date());
	age = Math.ceil(age / (1000 * 3600 * 24));

	var years = Math.floor(age / 365);
	var mouths = Math.floor((age % 365) / 30);
	var rdm = ["Aujourd'hui, ", 'A ce jour', ''];
	var birthDay = rdm[Utils.random(rdm.length)];
	birthDay += "j'ai " + years + ' ans et ' + mouths + ' mois !';
	log.info("sayOdiAge() '" + birthDay + "'");
	Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: birthDay });
}

Odi.run('timer', 0);
var secInterval;
function setTimer(minutes) {
	if (typeof minutes !== undefined && minutes > 1) {
		minutes = 60 * minutes;
	} else {
		minutes = 60;
	}
	Odi.run('timer', Odi.run('timer') + minutes);
	var min = Math.floor(Odi.run('timer') / 60);
	var sec = Odi.run('timer') % 60;
	var ttsMsg =
		'Minuterie ' + (min > 0 ? (min > 1 ? min : ' une ') + ' minutes ' : '') + (sec > 0 ? sec + ' secondes' : '');
	Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: ttsMsg });
	if (Odi.run('timer') >= 60 && !secInterval) {
		startTimer();
	}
}

function startTimer() {
	var etat = 1;
	secInterval = setInterval(function() {
		Flux.next('interface', 'led', 'toggle', { leds: ['belly'], value: etat }, null, null, true);
		etat = 1 - etat;
		let timerCountDown = Odi.run('timer');
		if (timerCountDown < 10) {
			spawn('sh', [Odi._SHELL + 'timerSound.sh', 'almost']);
		} else {
			spawn('sh', [Odi._SHELL + 'timerSound.sh']);
		}
		Odi.run('timer', Odi.run('timer') - 1);
		timerCountDown = Odi.run('timer');
		if (timerCountDown % 120 == 0 && timerCountDown / 60 > 0) {
			Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: Odi.run('timer') / 60 + ' minutes et compte a rebours' });
		} else if (timerCountDown <= 0 && timerCountDown > -5) {
			clearInterval(secInterval);
			log.info('End Timer !');
			spawn('sh', [Odi._SHELL + 'timerSound.sh', 'end']);
			Flux.next('interface', 'led', 'blink', { leds: ['belly', 'eye'], speed: 90, loop: 12 });
			Flux.next('interface', 'tts', 'speak', { lg: 'fr', msg: 'Les raviolis sont cuits !' });
			Flux.next('interface', 'led', 'toggle', { leds: ['belly'], value: 0 }, 1);
		}
	}, 1000);
}

function stopTimer() {
	if (Odi.run('timer') > 0) {
		clearInterval(secInterval);
		Odi.run('timer', 0);
		Flux.next('interface', 'tts', 'speak', { lg: 'en', msg: 'Timer canceled' });
		Flux.next('interface', 'led', 'toggle', { leds: ['belly'], value: 0 }, null, null, true);
	}
}
