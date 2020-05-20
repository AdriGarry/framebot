#!/usr/bin/env node

'use strict';

const Core = require('../../core/Core').Core;

const Logger = require('../../api/Logger'),
	Utils = require('../../api/Utils'),
	CronJobList = require('../../api/CronJobList'),
	Observers = require('../../api/Observers');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
	{ id: 'strategy', fn: internetBoxStrategy },
	{ id: 'strategyOff', fn: internetBoxStrategyOff }
];

Observers.attachFluxParseOptions('service', 'internetNetwork', FLUX_PARSE_OPTIONS);

const INTERNET_BOX_STRATEGY_CRON = [
	{ cron: '0 55 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: true } } },
	{ cron: '0 10 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: false } } }
],
	internetBoxStrategyCrons = new CronJobList(INTERNET_BOX_STRATEGY_CRON, 'internetBoxOffStrategy', true);

var isOnline = true,
	internetTestInterval = setInterval(() => {
		Utils.testConnection()
			.then(onlineCallback)
			.catch(() => {
				log.info('testConnection failed, retrying...')
				Utils.testConnection()
					.then(log.info("I'm still online!"))
					.catch(notConnectedCallback);
			});
	}, 10 * 1000);

function onlineCallback() {
	if (!isOnline) {
		log.info();
		log.info("I'm back on the internet!");
		Utils.getPublicIp().then(ip => Core.run('network.public', ip));
	}
	isOnline = true;
}

function notConnectedCallback(err) {
	if (isOnline) {
		log.warn();
		log.warn("I've lost my internet connection!");
		Core.run('network.public', 'offline');
	}
	isOnline = false;
}

/** Function to get connected from 0 to 10 min of each hour */
function internetBoxStrategy() {
	log.info('Starting internet box strategy...');
	internetBoxStrategyCrons.start();
}

function internetBoxStrategyOff() {
	// TODO problem: parse receive from rfxcom instead of flux filter
	// TODO test internetBoxStrategyCrons.nextDate value in more than 15 min ?
	log.info('internetBoxStrategyOff', internetBoxStrategyCrons.nextDate());
	if (false) {
		log.info('Stopping internet box strategy');
		internetBoxStrategyCrons.stop();
		clearInterval(internetTestInterval);
	}
}
