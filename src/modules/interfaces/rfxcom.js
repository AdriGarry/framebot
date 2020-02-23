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
		if (flux.id == 'send') {
			sendStatus(flux.value);
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

log.debug('Rfxcom gateway initializing...');
rfxtrx.initialise(function() {
	Core.run('rfxcom', true);
	log.info(`Rfxcom gateway ready [${Utils.executionTime(Core.startTime)}ms]`);

	Core.do('interface|rfxcom|send', { device: 'plugB', value: true });

	rfxtrx.on('receive', function(evt) {
		Core.do('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
		log.info(`Rfxcom_receive: ${Buffer.from(evt).toString('hex')}`);
	});

	rfxtrx.on('disconnect', function(evt) {
		log.info(`Rfxcom disconnected! ${Buffer.from(evt).toString('hex')}`);
	});
});

function sendStatus(args) {
	if (!Core.run('rfxcom')) {
		Core.error('rfxcom gateway not initialized!', null, false);
		return;
	}
	log.debug(`sendStatus ${args}`);
	let deviceName = args.device,
		value = args.value;
	if (!DEVICE_LIST.hasOwnProperty(deviceName)) log.error('Unreconized device:', deviceName);
	else {
		if (value) DEVICE.switchOn(DEVICE_LIST[deviceName].id);
		else DEVICE.switchOff(DEVICE_LIST[deviceName].id);
	}
}
