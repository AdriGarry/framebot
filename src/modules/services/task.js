#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

Core.flux.service.task.subscribe({
	next: flux => {
		if (flux.id == 'beforeRestart') {
			beforeRestart();
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else Core.error('unmapped flux in Task service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	if (!Core.isAwake()) {
		// goToSleep 2 hours after sleep mode
		Utils.delay(120 * 60).then(goToSleep);
	}
});

function goToSleep() {
	log.info('goToSleep');

	// light
	Core.do('interface|hardware|light', 5 * 60);

	// stop plugA & plugB
	Core.do('interface|rfxcom|send', { device: 'plugA', continu: false });
	Core.do('interface|rfxcom|send', { device: 'plugB', continu: false });

	// TODO radiator off ?
}

function beforeRestart() {
	log.info('beforeRestart');
	Core.do('interface|rfxcom|send', { device: 'plugB', value: true });
}
