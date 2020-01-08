#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	// cron: {
	// 	// 	base: [{ cron: '30 0 * * * *', flux: { id: 'service|scheduler|scheduleSend' } }]
	// }
};

Core.flux.service.radiator.subscribe({
	next: flux => {
		if (flux.id == 'a') {
			//
		} else if (flux.id == 'b') {
			//
		} else Core.error('unmapped flux in Radiator service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	radiatorCrons();
});

function radiatorCrons() {
	log.info('radiatorCrons', Core.conf('radiator'));
}
