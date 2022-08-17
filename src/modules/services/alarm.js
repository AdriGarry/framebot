#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Files, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '1 * * * * *', flux: { id: 'service|alarm|isAlarm', conf: { log: 'debug' } } }],
    full: []
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'set', fn: setAlarm },
  { id: 'off', fn: disableAllAlarms },
  { id: 'isAlarm', fn: isAlarm }
];

Observers.attachFluxParseOptions('service', 'alarm', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  isAlarm();
});

/** Function to disable all alarms */
function disableAllAlarms() {
  new Flux('interface|tts|speak', 'Annulation de toutes les alarmes');
  new Flux('service|context|update', { alarms: { weekDay: null, weekEnd: null } }, { delay: 4 });
}

/** Function to set custom alarm */
function setAlarm(alarm) {
  let newAlarms = {};
  Object.keys(Core.conf('alarms')).forEach(function (key, index) {
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
  new Flux('interface|tts|speak', alarmTTS);
  new Flux('service|context|update', { alarms: newAlarms });
  new Flux('service|alarm|isAlarm');
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
      log.info('Alarm time...', alarms[alarmType].h + ':' + alarms[alarmType].m);
      if (!Core.isAwake()) {
        new Flux('service|context|restart');
      } else {
        setImmediate(() => {
          startAlarmSequence();
        });
      }
    }
  }
}

function startAlarmSequence() {
  if (Core.run('etat') === 'low') {
    log.info('Escaping alarm sequence.');
    new Flux('service|time|now');
    return;
  }

  Core.run('alarm', true);
  alarmPart1()
    .then(alarmPart2)
    .then(alarmPart3)
    .then(() => Core.run('alarm', false))
    .catch(err => {
      Core.error('Alarm error', err);
    });
}

/** Function alarm part 1 */
function alarmPart1() {
  return new Promise((resolve, reject) => {
    log.info('Morning Sea...');
    new Flux('interface|sound|play', { file: 'system/morningSea.mp3' });
    Files.getDuration(Core._MP3 + 'system/morningSea.mp3')
      .then(data => {
        log.debug('seaDuration', data);
        setTimeout(function () {
          new Flux('interface|sound|mute');
          resolve();
        }, (data * 1000) / 2); //data * 1000
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
    new Flux('interface|arduino|write', 'playHornDoUp');
    new Flux('interface|sound|play', { file: 'system/cocorico.mp3', volume: 10 });
    if (isBirthday()) {
      new Flux('service|party|birthdaySong');
      setTimeout(function () {
        resolve();
      }, 53 * 1000);
    } else {
      resolve();
    }
  });
}

/** Function alarm part 3 */
function alarmPart3() {
  return new Promise((resolve, reject) => {
    let delay = 3;
    new Flux('service|max|hornRdm');
    new Flux('service|time|today', null, { delay: delay });

    delay += 3;
    new Flux('service|time|now', null, { delay: delay });

    delay += 5;
    new Flux('service|weather|report', null, { delay: delay });

    delay += 15;
    new Flux('service|voicemail|check', null, { delay: delay });

    delay += Core.run('voicemail') * 100;
    new Flux('service|audioRecord|check', null, { delay: delay });

    delay += Core.run('audioRecord') * 100;
    new Flux('service|music|radio', 'fip', { delay: delay });

    new Flux('service|max|playOneMelody', null, { delay: 8 * 60, loop: 8 });
    new Flux('service|max|hornRdm', null, { delay: 12 * 60, loop: 6 });

    if (!Utils.isWeekend()) {
      new Flux('interface|tts|speak', 'As-tu fais tes exercices ce matin ?', { delay: 120 });
    }

    setTimeout(() => {
      resolve();
    }, (delay + 10) * 1000);
  });
}

function isBirthday() {
  log.debug('isBirthday');
  let today = {
    date: new Date()
  };
  today.day = today.date.getDate();
  today.month = today.date.getMonth() + 1;
  for (const element of Core.descriptor.birthdays) {
    let splited = element.split('/');
    if (today.day == splited[0] && today.month == splited[1]) {
      return true;
    }
  }
  return false;
}
