#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

Core.flux.service.time.subscribe({
	next: flux => {
		if (flux.id == 'now') {
			now();
		} else if (flux.id == 'today') {
			today();
		} else if (flux.id == 'setAlarm') {
			setAlarm(flux.value);
		} else if (flux.id == 'alarmOff') {
			disableAllAlarms(flux.value);
		} else if (flux.id == 'isAlarm') {
			isAlarm();
		} else if (flux.id == 'timer') {
			if (flux.value == 'stop') {
				stopTimer();
			} else setTimer(flux.value);
		} else if (flux.id == 'birthday') {
			birthdaySong();
		} else if (flux.id == 'age') {
			ttsAge();
		} else Core.error('unmapped flux in Time service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

setImmediate(() => {
	isAlarm();
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

/** Function to disable all alarms */
function disableAllAlarms() {
	Core.do('interface|tts|speak', 'Annulation de toutes les alarmes');
	Core.do(
		'interface|runtime|updateRestart',
		{
			alarms: {
				weekDay: null,
				weekEnd: null
			}
		},
		{
			delay: 4
		}
	);
}

/** Function to set custom alarm */
function setAlarm(alarm) {
	var newAlarms = {};
	Object.keys(Core.conf('alarms')).forEach(function(key, index) {
		if (key == alarm.when) {
			newAlarms[key] = {
				h: alarm.h,
				m: alarm.m
			};
			log.info('>> ' + alarm.when + ' alarm set to ' + alarm.h + '.' + alarm.m);
		} else {
			newAlarms[key] = Core.conf('alarms.' + key);
		}
	});
	let alarmMode = alarm.when == 'weekDay' ? 'semaine' : 'weekend';
	let alarmTTS = 'Alarme ' + alarmMode + ' ' + alarm.h + ' heure ' + (alarm.m ? alarm.m : '');
	Core.do('interface|tts|speak', alarmTTS);
	Core.do(
		'interface|runtime|updateRestart',
		{
			alarms: newAlarms
		},
		{
			delay: 6
		}
	);
}

/** Function to test if alarm now */
const WEEK_DAYS = [1, 2, 3, 4, 5];
function isAlarm() {
	let now = new Date(),
		d = now.getDay(),
		h = now.getHours(),
		m = now.getMinutes(),
		alarmType = WEEK_DAYS.includes(d) ? 'weekDay' : 'weekEnd',
		alarms = Core.conf('alarms');

	if (alarms[alarmType]) {
		if (h == alarms[alarmType].h && m == alarms[alarmType].m) {
			log.info('alarm time...', alarms[alarmType].h + ':' + alarms[alarmType].m);
			Core.run('alarm', true);
			if (!Core.isAwake()) {
				log.INFO('wake up !!');
				Core.do('service|system|restart');
			} else {
				setImmediate(() => {
					cocorico();
				});
			}
		}
	}
}

/** Function alarm part 1 */
function cocorico() {
	log.info('Morning Sea...');
	Core.do('interface|sound|play', { mp3: 'system/morningSea.mp3' });
	Utils.getSoundDuration(Core._MP3 + 'system/morningSea.mp3', function(seaDuration) {
		log.debug('seaDuration', seaDuration);
		setTimeout(function() {
			cocoricoPart2();
		}, seaDuration * 1000);
	});
}

/** Function alarm part 2 */
function cocoricoPart2() {
	log.info('cocorico !!');
	Core.do('interface|arduino|write', 'playHornDoUp');
	Core.do('interface|sound|play', { mp3: 'system/cocorico.mp3' });
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
	let delay = 3;
	Core.do('service|max|hornRdm');
	Core.do('service|time|today', null, {
		delay: delay
	});

	delay += 3;
	Core.do('service|time|now', null, {
		delay: delay
	});

	delay += 2;
	Core.do('service|weather|report', null, {
		delay: delay
	});

	delay += 10;
	Core.do('service|voicemail|check', null, {
		delay: delay
	});

	delay += Core.run('voicemail') * 10;
	Core.do('service|audioRecord|check', null, {
		delay: delay
	});

	delay += Core.run('audioRecord') * 10;
	Core.do('service|music|fip', null, {
		delay: delay
	});

	Core.do('service|max|playOneMelody', null, {
		delay: 8 * 60,
		loop: 8
	});
	Core.do('service|max|hornRdm', null, {
		delay: 12 * 60,
		loop: 6
	});

	var baluchonTTS = "Je crois qu'il faut lancer l'opairation baluchon";
	Core.do('interface|tts|speak', baluchonTTS, {
		delay: Utils.random(15, 25) * 60,
		loop: 3
	});

	setTimeout(() => {
		Core.run('alarm', false);
	}, delay * 1000);
}

const BIRTHDAYS = ['17/04', '13/12', '31/07'];

function isBirthday() {
	log.info('isBirthday');
	var today = {
		date: new Date()
	};
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
	Core.do('interface|sound|play', {
		mp3: 'system/birthday.mp3'
	});
}

/** Function to TTS age */
const DATE_BIRTH = new Date(Core.descriptor.birthday);

function ttsAge() {
	var age = Math.abs(DATE_BIRTH.getTime() - new Date());
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

// Core.run('timer', 0); // TODO useless, to remove ?
var secInterval;

function setTimer(minutes) {
	if (typeof minutes !== undefined && Number(minutes) > 1) {
		minutes = 60 * Number(minutes);
	} else {
		minutes = 60;
	}
	Core.run('timer', Core.run('timer') + minutes);
	if (!secInterval) {
		startTimer();
	}
	var min = Math.floor(Core.run('timer') / 60);
	var sec = Core.run('timer') % 60;
	var ttsMsg =
		'Minuterie ' + (min > 0 ? (min > 1 ? min : ' une ') + ' minutes ' : '') + (sec > 0 ? sec + ' secondes' : '');
	Core.do('interface|tts|speak', {
		lg: 'fr',
		msg: ttsMsg
	});
}

function startTimer() {
	let etat = 1;
	secInterval = setInterval(function() {
		Core.do(
			'interface|led|toggle',
			{
				leds: ['belly'],
				value: etat
			},
			{
				hidden: true
			}
		);
		etat = 1 - etat;
		if (Core.run('timer') < 10) {
			Core.do('interface|sound|play', { mp3: 'system/timerAlmostEnd.mp3', noLog: true }, { hidden: true });
		} else {
			Core.do('interface|sound|play', { mp3: 'system/timer.mp3', noLog: true }, { hidden: true });
		}
		Core.run('timer', Core.run('timer') - 1);
		if (Core.run('timer') % 120 == 0 && Core.run('timer') / 60 > 0) {
			Core.do('interface|tts|speak', {
				lg: 'fr',
				msg: Core.run('timer') / 60 + ' minutes et compte a rebours'
			});
		} else if (Core.run('timer') <= 0 && Core.run('timer') > -5) {
			clearInterval(secInterval);
			log.info('End Timer !');
			Core.do('interface|sound|play', { mp3: 'system/timerEnd.mp3', noLog: true });
			Core.do('interface|led|blink', {
				leds: ['belly', 'eye'],
				speed: 90,
				loop: 12
			});
			Core.do('interface|tts|speak', 'Les raviolis sont cuits !');
			Core.do(
				'interface|led|toggle',
				{
					leds: ['belly'],
					value: 0
				},
				{
					delay: 1
				}
			);
		}
	}, 1000);
}

function stopTimer() {
	if (Core.run('timer') > 0) {
		clearInterval(secInterval);
		secInterval = false;
		Core.run('timer', 0);
		Core.do('interface|tts|speak', {
			lg: 'en',
			msg: 'Timer canceled'
		});
		Core.do(
			'interface|led|toggle',
			{
				leds: ['belly'],
				value: 0
			},
			{
				hidden: true
			}
		);
	}
}
