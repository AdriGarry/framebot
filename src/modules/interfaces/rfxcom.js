#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

const rfxcom = require('rfxcom'),
	rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: Core.conf('log') == 'info' ? false : true });

module.exports = {};

Core.flux.interface.rfxcom.subscribe({
	next: flux => {
		if (flux.id == 'set') {
			setStatus(flux.value);
		} else {
			Core.error('unmapped flux in Rfxcom interface', flux, false);
		}
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

const DEVICE = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);
const DEVICE_LIST = Utils.arrayToObject(Core.descriptor.rfxcom, 'name');

rfxtrx.initialise(function() {
	Core.run('rfxcom', true);
	log.info('Rfxcom gateway ready');
});

rfxtrx.on('receive', function(evt) {
	log.info('Rfxcom_receive:', Buffer.from(evt).toString('hex'));
});

rfxtrx.on('disconnect', function(evt) {
	log.info('Rfxcom disconnected!', Buffer.from(evt).toString('hex'));
});

function setStatus(args) {
	if (!Core.run('rfxcom')) {
		log.warn('rfxcom not yet initialized!');
		return;
	}
	log.info('setStatus', args);
	let deviceName = args.device,
		value = args.value;
	if (!DEVICE_LIST.hasOwnProperty(deviceName)) log.error('Unreconized device:', deviceName);
	else {
		if (value) DEVICE.switchOn(DEVICE_LIST[deviceName].id);
		else DEVICE.switchOff(DEVICE_LIST[deviceName].id);
	}
}
