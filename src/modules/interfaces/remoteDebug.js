#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

const inspector = require('inspector');

module.exports = {
	api: {
		full: {
			POST: [
				{ url: 'remoteDebug/start', flux: { id: 'interface|remoteDebug|start' } },
				{ url: 'remoteDebug/stop', flux: { id: 'interface|remoteDebug|start' } },
				{ url: 'remoteDebug/toggle', flux: { id: 'interface|remoteDebug|toggle' } }
			]
		}
	}
};

Core.flux.interface.remoteDebug.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			startRemoteDebug();
		} else if (flux.id == 'stop') {
			stopRemoteDebug();
		} else if (flux.id == 'toggle') {
			toggleRemoteDebug();
		} else Core.error('unmapped flux in remoteDebug service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});


function startRemoteDebug() {
	inspector.open(9229)
	Core.run('remoteDebug', inspector.url());
	log.info('Remote debug started on', inspector.url())
}

function stopRemoteDebug() {
	inspector.close();
	log.info('Remote debug stopped')
	Core.run('remoteDebug', false);
}

function toggleRemoteDebug() {
	log.debug('toggle remote debug')
	if (Core.run('remoteDebug')) {
		stopRemoteDebug();
	} else {
		startRemoteDebug();
	}
}