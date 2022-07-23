#!/usr/bin/env node
'use strict';

const Gpio = require('onoff').Gpio;

const Observers = require('./../../api/Observers');

const { Core } = require('./../../api');

let Led = {};

Core.gpio.leds.forEach(led => {
  Led[led.id] = new Gpio(led.pin, led.direction);
});

module.exports = {
  cron: {
    base: [
      {
        cron: '*/3 * * * * *',
        flux: { id: 'interface|led|blink', data: { leds: ['nose'], speed: 200, loop: 1 }, conf: { log: 'trace' } },
        log: 'Activity led initialised [' + Core.conf('mode') + ']'
      }
    ]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'activitySignal', fn: activitySignal },
  { id: 'toggle', fn: toggle },
  { id: 'blink', fn: blink },
  { id: 'altLeds', fn: altLeds },
  { id: 'clearLeds', fn: clearLeds }
];

Observers.attachFluxParseOptions('interface', 'led', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  activitySignal();
});

function activitySignal() {
  let mode = Core.isAwake() ? 1 : 0;

  setInterval(function () {
    Led.nose.writeSync(mode);
  }, 900);
}

/** Fonction to blink leds
 * @param config : {
 * 	leds : ['eye', 'satellite'...]
 *		speed : number (50 - 200)
 *		loop : number (<1)
 *	}
 */
function blink(config) {
  try {
    let etat = 1,
      loop;
    if (config.hasOwnProperty('leds')) {
      setTimeout(function () {
        for (let led in config.leds) {
          Led[config.leds[led]].writeSync(0);
        }
      }, config.speed * config.loop * 2 + 50);
      for (loop = config.loop * 2; loop > 0; loop--) {
        setTimeout(
          function (leds) {
            for (let i in leds) {
              let led = leds[i];
              Led[led].writeSync(etat);
            }
            etat = 1 - etat;
          },
          config.speed * loop,
          config.leds
        );
      }
    }
  } catch (err) {
    Core.error('Led blink error', err);
  }
}

/** Function to toggle a led
 * @param config : {
 * 	leds : 'eye'
 *		value : true/false
 } */
function toggle(config) {
  // log.info('toogle:', config);
  // if (['nose', 'eye', 'satellite', 'belly'].indexOf(config.led) > -1) {
  for (let led in config.leds) {
    Led[config.leds[led]].writeSync(config.value ? 1 : 0);
  }
  if (Object.keys(Led).indexOf(config.led) > -1) {
    Led[config.led].writeSync(config.mode ? 1 : 0);
  }
}

/** Function to start inverted blink (Eye/Belly) */
let timer;
function altLeds(args) {
  // args : {speed, duration}
  clearInterval(timer);
  let etat = 1;
  timer = setInterval(function () {
    Led.eye.writeSync(etat);
    etat = 1 - etat;
    Led.belly.writeSync(etat);
  }, args.speed);
  setTimeout(function () {
    clearInterval(timer);
    Led.eye.writeSync(0);
    Led.belly.writeSync(0);
  }, args.duration * 1000);
}

/** Function to cancel blinkState */
function clearLeds() {
  clearInterval(timer);
}

/** Function to switch on all leds */
function allLedsOn() {
  Led.eye.writeSync(1);
  Led.belly.writeSync(1);
  Led.satellite.writeSync(1);
  Led.nose.writeSync(1); // EXCEPT ACTIVITY LED ??
}

/** Function to swith off all leds */
function allLedsOff() {
  Led.eye.writeSync(0);
  Led.belly.writeSync(0);
  Led.satellite.writeSync(0);
  Led.nose.writeSync(0); // EXCEPT ACTIVITY LED ??
}
