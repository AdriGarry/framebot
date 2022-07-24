#!/usr/bin/env node

'use strict';

const { Flux, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'on', fn: lightOn },
  { id: 'motionDetect', fn: motionDetectLight },
  { id: 'blinkOff', fn: blinkThenOff }
];

Observers.attachFluxParseOptions('service', 'light', FLUX_PARSE_OPTIONS);

const LIGTH_LEDS = ['eye', 'belly'];
function lightOn(duration) {
  log.info('light On', duration ? '[duration=' + duration + 's]' : '');
  new Flux('interface|led|toggle', { leds: LIGTH_LEDS, value: 1 }, { log: 'TRACE' });
  if (duration) {
    new Flux('interface|led|toggle', { leds: LIGTH_LEDS, value: 0 }, { delay: duration, log: 'TRACE' });
  }
}

function motionDetectLight() {
  new Flux('interface|led|toggle', { leds: LIGTH_LEDS, value: 1 }, { log: 'TRACE' });
  new Flux('interface|led|blink', { leds: LIGTH_LEDS, speed: 150, loop: 2 }, { delay: 1, log: 'TRACE' });
  new Flux('interface|led|toggle', { leds: LIGTH_LEDS, value: 0 }, { delay: 1, log: 'TRACE' });
}

function blinkThenOff() {
  new Flux('interface|led|blink', { leds: LIGTH_LEDS, speed: 150, loop: 2 }, { log: 'TRACE' });
  new Flux('interface|led|toggle', { leds: LIGTH_LEDS, value: 0 }, { delay: 0.3, log: 'TRACE' });
}
