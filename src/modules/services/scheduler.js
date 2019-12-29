#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	cron: {
		base: [{ cron: '10 */10 * * * *', flux: { id: 'service|scheduler|scheduleSend' } }]
	}
};

Core.flux.service.scheduler.subscribe({
	next: flux => {
		if (flux.id == 'setState') {
			setState(flux.value);
		} else if (flux.id == 'send') {
			send();
		} else if (flux.id == 'timer') {
			timer(flux.value);
		} else if (flux.id == 'reset') {
			resetScheduler();
		} else Core.error('unmapped flux in Time Range service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	scheduler(); // TODO usefull?
});

// TODO use moment.js? https://www.npmjs.com/package/moment

// scheduleSend
function scheduleSend() {
	log.info('scheduler.scheduleSend...');
}

// on/off
function setState(state) {
	log.info('scheduler.state:', state);
}

// timer
function timer(time) {
	log.info('scheduler.timer:', time);
}

function resetScheduler() {
	log.info('scheduler.resetScheduler');
}

// scheduler => cron
function scheduler() {
	log.info('scheduler.scheduler');
}
