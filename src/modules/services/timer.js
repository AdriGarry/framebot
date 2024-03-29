#!/usr/bin/env node

'use strict';

const { Core, Flux, Logger, Observers, Scheduler } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'increase', fn: setTimer },
  { id: 'stop', fn: stopTimer }
];

Observers.attachFluxParseOptions('service', 'timer', FLUX_PARSE_OPTIONS);

function setTimer(minutes) {
  if (typeof minutes === 'number' && Number(minutes) > 1) {
    minutes = 60 * Number(minutes);
  } else {
    minutes = 60;
  }
  Core.run('timer', Core.run('timer') + minutes);
  Scheduler.stopDecrement('timer');
  Scheduler.decrement('timer', Core.run('timer'), endTimerTimeout, 1, decrementTimerTimeout);
  let min = Math.floor(Core.run('timer') / 60);
  let sec = Core.run('timer') % 60;
  let ttsMsg = 'Minuterie ' + (min > 0 ? (min > 1 ? min : ' une ') + ' minutes ' : '') + (sec > 0 ? sec + ' secondes' : '');
  Flux.do('interface|tts|speak', {
    lg: 'fr',
    msg: ttsMsg
  });
}

function decrementTimerTimeout() {
  toggleBellyLed();
  let remainingTime = Core.run('timer');
  if (remainingTime < 10) {
    Flux.do('interface|sound|play', { file: 'system/timerAlmostEnd.mp3', noLog: true, noLed: true }, { log: 'trace' });
  } else {
    Flux.do('interface|sound|play', { file: 'system/timer.mp3', noLog: true, noLed: true }, { log: 'trace' });
  }
  remainingTime = remainingTime - 1;
  Core.run('timer', remainingTime);
  if (remainingTime / 60 > 0 && remainingTime % 60 == 0) {
    Flux.do('interface|tts|speak', remainingTime / 60 + ' minutes et compte a rebours');
  }
}

let ledState = 1;

function toggleBellyLed() {
  Flux.do('interface|led|toggle', { leds: ['belly'], value: ledState }, { log: 'trace' });
  ledState = 1 - ledState;
}

function endTimerTimeout() {
  log.info('End Timer !');
  Core.run('timer', 0);
  Flux.do('interface|sound|play', { file: 'system/timerEnd.mp3', noLog: true });
  Flux.do('interface|led|blink', { leds: ['belly', 'eye'], speed: 90, loop: 12 });
  Flux.do('interface|tts|speak', 'Les raviolis sont cuits !');
  Flux.do('interface|led|toggle', { leds: ['belly'], value: 0 }, { delay: 1 });
}

function stopTimer() {
  Core.run('timer', 0);
  Scheduler.stopDecrement('timer');
  Flux.do('interface|tts|speak', { lg: 'en', msg: 'Timer canceled' });
  Flux.do('interface|led|toggle', { leds: ['belly'], value: 0 }, { log: 'trace' });
}
