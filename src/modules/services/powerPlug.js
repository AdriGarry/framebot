#!/usr/bin/env node

'use strict';

const Core = require('../../core/Core').Core;

const { Flux, Logger, Observers, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
	{ id: 'toggle', fn: togglePlug },
	{ id: 'timeout', fn: setPlugTimeout }];

Observers.attachFluxParseOptions('service', 'powerPlug', FLUX_PARSE_OPTIONS);

setImmediate(() => {
	Utils.delay(10).then(setupPlugTimeoutAtStartup);
});

var PLUG_TIMEOUTS = {};

function setupPlugTimeoutAtStartup() {
	let existingPowerPlugValues = Core.conf('powerPlug');
	if (existingPowerPlugValues && typeof existingPowerPlugValues === 'object' && Object.keys(existingPowerPlugValues).length > 0) {
		log.info('setupPlugTimeoutAtStartup');
		Object.keys(existingPowerPlugValues).forEach(plugId => {
			let plugTimeoutData = existingPowerPlugValues[plugId];
			plugTimeoutData['plug'] = plugId;
			setPlugTimeout(plugTimeoutData);
		});
	}
}

function togglePlug(arg) {
	log.info('togglePlug', arg);
	removePlugTimeoutFromConf(arg.plug);
	plugOrder(arg.plug, arg.mode);
}

function removePlugTimeoutFromConf(plugId) {
	log.debug('removePlugTimeoutFromConf')
	let powerPlugToUpdate = Core.conf('powerPlug');
	delete powerPlugToUpdate[plugId];
	Core.conf('powerPlug', powerPlugToUpdate);
}

function setPlugTimeout(arg) {
	log.info('setPlugTimeout', arg);
	clearTimeout(PLUG_TIMEOUTS[arg.plug]);
	plugOrder(arg.plug, arg.mode);

	let powerPlugToUpdate = Core.conf('powerPlug');
	powerPlugToUpdate[arg.plug] = { mode: arg.mode, timeout: arg.timeout };
	Core.conf('powerPlug', powerPlugToUpdate);
	decrementPlugTimeout(arg.plug);
}

function decrementPlugTimeout(plugId) {
	let arg = Core.conf('powerPlug.' + plugId);
	log.info('decrementPlugTimeout', arg, plugId);
	if (!arg.timeout) {
		endPlugTimeout(plugId);
		return;
	}
	PLUG_TIMEOUTS[plugId] = setTimeout(() => {
		arg.timeout = --arg.timeout;
		Core.conf('powerPlug.' + plugId, arg);
		decrementPlugTimeout(plugId);
	}, 60 * 1000);
}

function endPlugTimeout(plugId) {
	let plugTimeoutMode = Core.conf('powerPlug.' + plugId).mode;
	clearTimeout(PLUG_TIMEOUTS[plugId]);
	removePlugTimeoutFromConf(plugId);

	let newPlugTimeoutMode = plugTimeoutMode == 'on' ? 'off' : 'on'; // invert mode
	plugOrder(plugId, newPlugTimeoutMode);
	log.info(plugId, 'timeout, back to', newPlugTimeoutMode);
}

function plugOrder(plugId, mode) {
	let booleanMode = getBooleanValue(mode);
	log.info('plugOrder', plugId, mode, '=>', booleanMode);
	new Flux('interface|rfxcom|send', { device: plugId, value: booleanMode });
}


function getBooleanValue(mode) {
	if (typeof mode === 'boolean') return mode;
	if (mode === 'on') return true;
	else return false;
}
