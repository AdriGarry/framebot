#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

Core.flux.service.alarm.subscribe({
	next: flux => {
		if (flux.id == 'setAlarm') {
			setAlarm(flux.value);
		} else if (flux.id == 'alarmOff') {
			disableAllAlarms(flux.value);
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
	Core.do(
		'service|context|updateRestart',
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
		'service|context|updateRestart',
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
	Utils.getSoundDuration(Core._MP3 + 'system/morningSea.mp3')
		.then(data => {
			log.debug('seaDuration', data);
			setTimeout(function() {
				cocoricoPart2();
			}, data * 1000);
		})
		.catch(err => {
			Core.error('cocorico error', err);
		});
}

function isBirthday() {
	log.info('isBirthday');
	var today = {
		date: new Date()
	};
	today.day = today.date.getDate();
	today.month = today.date.getMonth() + 1;
	for (var i = 0; i < Core.descriptor.birthdays.length; i++) {
		var splited = Core.descriptor.birthdays[i].split('/');
		if (today.day == splited[0] && today.month == splited[1]) {
			return true;
		}
	}
	return false;
}

/** Function alarm part 2 */
function cocoricoPart2() {
	log.info('cocorico !!');
	Core.do('interface|arduino|write', 'playHornDoUp');
	Core.do('interface|sound|play', { mp3: 'system/cocorico.mp3' });
	if (isBirthday()) {
		Core.do('service|time|birthday');
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

	delay += 5;
	Core.do('service|weather|astronomy', null, {
		delay: delay
	});

	delay += 15;
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

	Core.do('service|interaction|baluchon', null, {
		delay: Utils.random(15, 25) * 60,
		loop: 3
	});

	setTimeout(() => {
		Core.run('alarm', false);
	}, delay * 1000);
}
