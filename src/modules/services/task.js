#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename),
	{ Utils, CronJobList } = require(Core._API + 'api.js');

Core.flux.service.task.subscribe({
	next: flux => {
		if (flux.id == 'beforeRestart') {
			beforeRestart();
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else if (flux.id == 'internetBoxOff') {
			internetBoxOffStrategy();
		} else if (flux.id == 'certbot') {
			renewCertbot();
		} else Core.error('unmapped flux in Task service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	if (!Core.isAwake()) {
		if (Core.conf('alarms').weekDay && Core.conf('alarms').weekEnd) {
			// if any alarm scheduled, goToSleep 2 hours after sleep mode
			Utils.delay(120 * 60).then(goToSleep);
			log.info('Alarm(s) scheduled, go to sleep task scheduled in 2 hours');
		} else {
			log.warn('No alarm scheduled, should not switch off internet box');
		}
	}
	Utils.testConnection().catch(() => {
		log.warn('No internet connection => internetBoxOffStrategy...');
		internetBoxOffStrategy();
	});
});

const GO_TO_SLEEP_DELAY = 5 * 60;

function goToSleep() {
	log.info(`goToSleep in ${GO_TO_SLEEP_DELAY / 60} min`);

	// light
	Core.do('interface|hardware|light', GO_TO_SLEEP_DELAY);

	// radiator off
	Core.do('interface|rfxcom|send', { device: 'radiator', value: true });

	// plugA & plugB off
	Core.do('interface|rfxcom|send', { device: 'plugA', value: false }, { delay: 60 });
	Core.do('interface|rfxcom|send', { device: 'plugB', value: false }, { delay: 60 });

	if (Core.isAwake()) {
		Core.do('service|context|sleep', null, { delay: GO_TO_SLEEP_DELAY });
	}
}

function beforeRestart() {
	log.info('beforeRestart');
	Core.do('interface|rfxcom|send', { device: 'plugB', value: true });
}

const INTERNET_BOX_STRATEGY_CRON = [
	{ cron: '0 55 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: true } } },
	{ cron: '0 10 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: false } } }
];

/** Function to get connected from 0 to 10 min of each hour */
function internetBoxOffStrategy() {
	let internetBoxStrategyCrons = new CronJobList(INTERNET_BOX_STRATEGY_CRON, 'internetBoxOffStrategy', true);
	log.info('setting up internetBoxOffStrategy...');
	internetBoxStrategyCrons.start();

	let isOnline = true;
	setInterval(() => {
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
					log.warn("I've just lost my internet connection!");
				}
				isOnline = false;
			});
	}, 30 * 1000);
}

function renewCertbot() {
	log.INFO('renew Certbot certificate');
	// TODO y'a un truc car il faut intervenir dans le script
	// TODO use https://www.npmjs.com/package/greenlock
	Utils.execCmd('core certbot')
		.then(data => {
			log.info('core certificate successfully', data);
			resolve(lastDate[0]);
		})
		.catch(err => {
			Core.error('retreiveLastModifiedDate error', err);
			reject(err);
		});
}
