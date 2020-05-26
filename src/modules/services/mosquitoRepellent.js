#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const Core = require('../../core/Core').Core;

const Logger = require('../../api/Logger'),
	Flux = require('../../api/Flux'),
	Utils = require('../../api/Utils'),
	CronJobList = require('../../api/CronJobList'),
	Observers = require('../../api/Observers');

const log = new Logger(__filename);

module.exports = {};

const TIMEOUT = { 'ON': 2, 'OFF': 8 };

setImmediate(() => {
	Utils.delay(10).then(initMosquitoRepellentMode);
});

function initMosquitoRepellentMode() {
	let today = new Date();
	if (today.getMonth() < 4 || today.getMonth() > 9) {
		log.debug('not in mosquito season!');
		return;
	}
	log.info('init mosquito repellent mode [' + Utils.executionTime(Core.startTime) + 'ms]');
	togglePlug(true);
}

function togglePlug(mode, timeout) {
	log.debug('togglePlug', mode, timeout);
	if (!timeout || mode) timeout = TIMEOUT.ON;
	else timeout = TIMEOUT.OFF;
	log.info('toggle mosquito repellent plug', mode ? 'on' : 'off', 'for ' + timeout + ' min');
	plugOrder(mode);
	Utils.delay(timeout * 60).then(() => {
		return togglePlug(!mode, timeout)
	});
}

function plugOrder(mode) {
	if (typeof mode !== 'boolean') mode = false;
	log.debug('mosquito repellent', mode);
	Core.run('mosquito', mode);
	new Flux('interface|rfxcom|send', { device: 'plugC', value: mode });
}

