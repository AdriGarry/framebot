#!/usr/bin/env node

'use strict';

const fs = require('fs'),
  SunCalc = require('suncalc'),
  CronJob = require('cron').CronJob;

const { Flux, Logger, Observers } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [];

Observers.attachFluxParseOptions('service', 'childNightLight', FLUX_PARSE_OPTIONS);

const CALC_SUN_TIMES_DELAY = 24 * 60;
const LATITUDE = 43.2965;
const LONGITUDE = 5.3698;

let childNightLightOn = false;

setTimeout(function () {
  initChildNightLight();
}, 30 * 1000);

function initChildNightLight() {
  log.info('init child night light...');
  new CronJob('15 * * * * *', function () {
    // '15 0,30 * * * *'
    toggleChildNightLightDependingOnSunPosition();
  }).start();
}

function toggleChildNightLightDependingOnSunPosition() {
  log.debug('toggleChildNightLightDependingOnSunPosition...');
  const times = SunCalc.getTimes(new Date(), LATITUDE, LONGITUDE);
  const now = new Date();
  if (now > times.sunset) {
    // night
    if (!childNightLightOn) {
      childNightLightOn = true;
      Flux.do('service|powerPlug|toggle', { plug: 'plug14', mode: true });
    }
  } else if (now > times.sunrise) {
    // day
    if (childNightLightOn) {
      childNightLightOn = false;
      Flux.do('service|powerPlug|toggle', { plug: 'plug14', mode: false });
    }
  }
}
