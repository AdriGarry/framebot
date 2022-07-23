#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');

const { Core, Flux, Logger, Observers } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'on', fn: screenOn },
  { id: 'off', fn: screenOff }
];

Observers.attachFluxParseOptions('interface', 'hdmi', FLUX_PARSE_OPTIONS);

/** Function to turn screen on (for 30 minutes) */
function screenOn() {
  spawn('/opt/vc/bin/tvservice', ['-p']);
  log.info('Hdmi on');
  Core.run('hdmi', true);
  setTimeout(function () {
    screenOff();
  }, 30 * 60 * 1000);
}

/** Function to turn screen off */
function screenOff() {
  spawn('/opt/vc/bin/tvservice', ['-o']);
  new Flux('service|video|stopLoop', null, { log: 'debug' });
  Core.run('hdmi', false);
  log.info('Hdmi off');
}
