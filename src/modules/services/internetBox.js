#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename),
	{ Utils, CronJobList } = require(Core._API + 'api.js');

Core.flux.service.internetBox.subscribe({
	next: flux => {
		if (flux.id == 'strategy') {
			internetBoxStrategy();
		} else if (flux.id == 'strategyOff') {
			internetBoxStrategyOff();
		} else Core.error('unmapped flux in InternetBox service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

const INTERNET_BOX_STRATEGY_CRON = [
		{ cron: '0 55 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: true } } },
		{ cron: '0 10 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: false } } }
	],
	internetBoxStrategyCrons = new CronJobList(INTERNET_BOX_STRATEGY_CRON, 'internetBoxOffStrategy', true);

var internetTestInterval = null,
	isOnline = true;

internetTestInterval = setInterval(() => {
	Utils.testConnection()
		.then(() => {
			if (!isOnline) {
				log.info();
				log.info("I'm back on the internet!");
			}
			isOnline = true;
		})
		.catch(() => {
			if (isOnline) {
				log.warn();
				log.warn("I've lost my internet connection!");
			}
			isOnline = false;
		});
}, 10 * 1000);

/** Function to get connected from 0 to 10 min of each hour */
function internetBoxStrategy() {
	log.info('Starting internet box strategy...');
	internetBoxStrategyCrons.start();
}

function internetBoxStrategyOff() {
	// TODO problem: parse receive from rfxcom instead of flux filter
	// TODO test internetBoxStrategyCrons.nextDate value in more than 15 min ?
	log.test('internetBoxStrategyOff', internetBoxStrategyCrons.nextDate());
	if (false) {
		log.info('Stopping internet box strategy');
		internetBoxStrategyCrons.stop();
		clearInterval(internetTestInterval);
	}
}
