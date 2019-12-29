#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

const rfxcom = require('rfxcom'),
	rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: Core.conf('log') == 'info' ? false : true });

module.exports = {};

Core.flux.interface.rfxcom.subscribe({
	next: flux => {
		if (flux.id == 'send') {
			sendDeviceStatus(flux.value);
		} else {
			Core.error('unmapped flux in Rfxcom interface', flux, false);
		}
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	// do something, or useless?
});

// setTimeout(() => {
// 	Core.do('interface|rfxcom|send', { device: 'plugB', value: true });
// 	Core.do('interface|rfxcom|send', { device: 'plugB', value: false }, { delay: 10 });
// }, 13000);

let ready = false;

rfxtrx.initialise(function() {
	log.info('Rfxcom gateway ready');
	ready = true;
});

const DEVICE = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);

rfxtrx.on('receive', function(evt) {
	log.debug('Rfxcom_receive:', Buffer.from(evt).toString('hex'));
});

const arrayToObject = array =>
	array.reduce((obj, item) => {
		obj[item.name] = item;
		return obj;
	}, {});

const DEVICE_LIST = arrayToObject(Core.descriptor.rfxcom);
// console.log(DEVICE_LIST);

function sendDeviceStatus(args) {
	log.info('sendDeviceStatus', args);
	if (!ready) {
		log.warn('rfxcom not initialized!');
		return;
	}
	let deviceName = args.device,
		value = args.value;
	// let knownDevice = DEVICE_LIST.filter(device => device.name === deviceName).length > 0;
	let knownDevice = DEVICE_LIST.hasOwnProperty(deviceName);
	// log.info(DEVICE_LIST[deviceName]);
	if (knownDevice) {
		if (value) DEVICE.switchOn(DEVICE_LIST[deviceName].id);
		else DEVICE.switchOff(DEVICE_LIST[deviceName].id);
	} else log.info('Unreconized device:', deviceName);
}
