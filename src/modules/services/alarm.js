#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

module.exports = {
	cron: {
		base: [{ cron: '1 * * * * *', flux: { id: 'service|alarm|isAlarm', conf: { log: 'trace' } } }],
		full: []
	}
};

Core.flux.service.alarm.subscribe({
	next: flux => {
		if (flux.id == 'set') {
			setAlarm(flux.value);
		} else if (flux.id == 'off') {
			disableAllAlarms();
		} else if (flux.id == 'isAlarm') {
			isAlarm();
		} else Core.error('unmapped flux in Alarm service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	isAlarm();
});

/** Function to disable all alarms */
function disableAllAlarms() {
	Core.do('interface|tts|speak', 'Annulation de toutes les alarmes');
	Core.do('service|context|updateRestart', { alarms: { weekDay: null, weekEnd: null } }, { delay: 4 });
}

/** Function to set custom alarm */
function setAlarm(alarm) {
	let newAlarms = {};
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
	Core.do('service|context|updateRestart', { alarms: newAlarms }, { delay: 3 });
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
				Core.do('service|context|restart');
			} else {
				setImmediate(() => {
					doAlarm();
				});
			}
		}
	}
}

/** Function alarm part 1 */
function doAlarm() {
	alarmPart1()
		.then(alarmPart2)
		.then(alarmPart3)
		// .then(alarmPart4)
		// .then(alarmPart5)
		.catch(err => {
			Core.error('Alarm error', err);
		});
}

/** Function alarm part 1 */
function alarmPart1() {
	return new Promise((resolve, reject) => {
		log.info('Morning Sea...');
		Core.do('interface|sound|play', { mp3: 'system/morningSea.mp3' });
		Utils.getDuration(Core._MP3 + 'system/morningSea.mp3')
			.then(data => {
				log.debug('seaDuration', data);
				setTimeout(function() {
					resolve();
				}, data * 1000);
			})
			.catch(err => {
				reject(err);
			});
	});
}

/** Function alarm part 2 */
function alarmPart2() {
	return new Promise((resolve, reject) => {
		log.info('cocorico !!');
		Core.do('interface|arduino|write', 'playHornDoUp');
		Core.do('interface|sound|play', { mp3: 'system/cocorico.mp3' });
		if (isBirthday()) {
			Core.do('service|time|birthday');
			setTimeout(function() {
				resolve();
			}, 53 * 1000);
		} else {
			resolve();
		}
	});
}

/** Function alarm part 3 */
function alarmPart3() {
	let delay = 3;
	Core.do('service|max|hornRdm');
	Core.do('service|time|today', null, { delay: delay });

	delay += 3;
	Core.do('service|time|now', null, { delay: delay });

	delay += 2;
	Core.do('service|weather|report', null, { delay: delay });

	delay += 5;
	Core.do('service|weather|astronomy', null, { delay: delay });

	delay += 15;
	Core.do('service|voicemail|check', null, { delay: delay });

	delay += Core.run('voicemail') * 10;
	Core.do('service|audioRecord|check', null, { delay: delay });

	delay += Core.run('audioRecord') * 10;
	Core.do('service|music|radio', 'fip', { delay: delay });

	Core.do('service|max|playOneMelody', null, { delay: 8 * 60, loop: 8 });
	Core.do('service|max|hornRdm', null, { delay: 12 * 60, loop: 6 });

	Core.do('service|interaction|baluchon', null, { delay: Utils.random(15, 25) * 60, loop: 3 });

	Core.do('interface|tts|speak', 'Allez, hop hop les abdo !', { delay: 50 });
	Core.do('interface|tts|speak', 'As-tu fais tes exercices ce matin ?', { delay: 3 * 60 });

	Core.do('service|interaction|goToWorkQueue', { delay: 70 * 60 });

	setTimeout(() => {
		Core.run('alarm', false);
	}, delay * 1000);
}

function isBirthday() {
	log.info('isBirthday');
	let today = {
		date: new Date()
	};
	today.day = today.date.getDate();
	today.month = today.date.getMonth() + 1;
	for (var i = 0; i < Core.descriptor.birthdays.length; i++) {
		let splited = Core.descriptor.birthdays[i].split('/');
		if (today.day == splited[0] && today.month == splited[1]) {
			return true;
		}
	}
	return false;
}
