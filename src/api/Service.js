#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._API + 'Logger.js'))(__filename),
	{ Utils } = require(Core._API + 'api.js');

// module.exports = {
// 	cron: {
// 		base: [{ cron: '1 * * * * *', flux: { id: 'service|alarm|isAlarm', conf: { log: 'trace' } } }],
// 		full: []
// 	}
// };

module.exports = class Service {
	constructor() {
		// flux parser here ?
	}

	doStuff() {
		//
	}
};

Core.flux.service.alarm.subscribe({
	next: flux => {
		if (flux.id == 'set') {
			setAlarm(flux.value);
		} else if (flux.id == 'isAlarm') {
			isAlarm();
		} else Core.error('unmapped flux in Alarm service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	//
});
