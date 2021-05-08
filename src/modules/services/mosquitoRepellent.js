#!/usr/bin/env node

'use strict';

const Core = require('../../core/Core').Core;

const { Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const TIMEOUT = { 'ON': 1, 'OFF': 4 };

var repellentMode = false, repellentTimeout;

const FLUX_PARSE_OPTIONS = [
	{ id: 'toggle', fn: toggleMosquitoRepellentMode }
];

Observers.attachFluxParseOptions('service', 'mosquitoRepellent', FLUX_PARSE_OPTIONS);

setImmediate(() => {
	Utils.delay(10).then(initMosquitoRepellentMode);
});

const MOSQUITO_MONTHS = [4, 5, 6, 7, 8];

function initMosquitoRepellentMode() {
	if (!isMosquitoSeason()) {
		log.debug('not in mosquito season!');
		return;
	}
	log.info('Init mosquito repellent mode [' + Utils.executionTime(Core.startTime) + 'ms]');
	repellentMode = true;
	togglePlug(true);
}

function toggleMosquitoRepellentMode() {
	if (repellentMode) {
		log.info('Aborting mosquito repellent mode');
		clearTimeout(repellentTimeout);
		plugOrder(false);
	} else {
		log.info('Starting mosquito repellent mode');
		togglePlug(true);
	}
	repellentMode = !repellentMode;
}

function togglePlug(mode, timeout) {
	log.debug('togglePlug', mode, timeout);
	if (!timeout || mode) timeout = TIMEOUT.ON;
	else timeout = TIMEOUT.OFF;
	log.info('toggle mosquito repellent plug', mode ? 'on' : 'off', 'for ' + timeout + ' min');
	plugOrder(mode);
	repellentTimeout = setTimeout(() => {
		return togglePlug(!mode, timeout)
	}, timeout * 60 * 1000);
}

function plugOrder(mode) {
	if (typeof mode !== 'boolean') mode = false;
	log.debug('mosquito repellent', mode);
	Core.run('mosquito', mode);
	new Flux('interface|rfxcom|send', { device: 'plugC', value: mode });
}

function isMosquitoSeason() {
	let currentMonth = new Date().getMonth();
	return MOSQUITO_MONTHS.includes(currentMonth);
}