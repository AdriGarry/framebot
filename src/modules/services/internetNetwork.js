#!/usr/bin/env node

'use strict';

const Core = require('../../core/Core').Core;

const { CronJobList, Logger, Observers, Utils } = require('./../../api');

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

var isOnline, isRetrying = false,
	internetTestInterval = setInterval(() => {
		testConnection()
			.then(onlineCallback)
			.catch(() => {
				isRetrying = true;
				log.info('Internet connection test failed, retrying...')
				testConnection()
					.then(onlineCallback)
					.catch(notConnectedCallback);
			});
	}, 10 * 1000);

function onlineCallback() {
	if (!isOnline || isRetrying) {
		log.info("I'm on the internet!");
		Utils.getPublicIp().then(ip => Core.run('network.public', ip));
	}
	isRetrying = false;
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

/** Function to test internet connection */
function testConnection() {
	let execTime = new Date();
	return new Promise((resolve, reject) => {
		dns.lookup('adrigarry.com', function (err) {
			if (err && err.code == 'ENOTFOUND') {
				log.debug('test connexion failed in', Utils.executionTime(execTime) + 'ms');
				reject(err);
			} else {
				resolve();
			}
		});
	});
}