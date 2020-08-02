#!/usr/bin/env node
'use strict';

const rfxcom = require('rfxcom');

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);

const rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: Core.conf('log') == 'info' ? false : true });

module.exports = {};

Observers.attachFluxParser('interface', 'rfxcom', rfxcomHandler);

function rfxcomHandler(flux) {
	if (flux.id == 'send' && flux.value.device === 'plugB' && flux.value.value === false) {
		sendStatus(flux.value);
		new Flux('service|internetNetwork|strategy');
	} else if (flux.id == 'send' && flux.value.device === 'plugB' && flux.value.value === true) {
		sendStatus(flux.value);
		new Flux('service|internetNetwork|strategyOff');
	} else if (flux.id == 'send') {
		sendStatus(flux.value);
	} else {
		Core.error('unmapped flux in Rfxcom interface', flux, false);
	}
}

const DEVICE = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);
const DEVICE_LIST = Core.descriptor.rfxcomDevices;

var powerPlugStatus = {};
Object.keys(DEVICE_LIST).forEach((key) => {
	powerPlugStatus[key] = { status: 'unknow' };
});
Core.run('powerPlug', powerPlugStatus)

rfxtrx.initialise(function () {
	Core.run('rfxcom', true);
	log.info('Rfxcom gateway ready', '[' + Utils.executionTime(Core.startTime) + 'ms]');

	rfxtrx.on('receive', function (evt) {
		new Flux('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
		log.info('Rfxcom_receive:', Buffer.from(evt).toString('hex'));
		parseReceivedSignal();
	});

	rfxtrx.on('disconnect', function (evt) {
		log.warn('Rfxcom disconnected!', Buffer.from(evt).toString('hex'));
	});
});

function sendStatus(args) {
	if (!Core.run('rfxcom')) {
		new Flux('interface|tts|speak', { lg: 'en', msg: 'rfxcom not initialized' });
		log.warn('rfxcom gateway not initialized!', null, false);
		return;
	}
	log.debug('sendStatus', args);
	let deviceName = args.device,
		value = args.value;
	if (!DEVICE_LIST.hasOwnProperty(deviceName)) log.error('Unknown device:', deviceName);
	else {
		if (value) DEVICE.switchOn(DEVICE_LIST[deviceName].id);
		else DEVICE.switchOff(DEVICE_LIST[deviceName].id);
		Core.run('powerPlug.' + deviceName, { status: value ? 'on' : 'off' })
	}
}

function parseReceivedSignal(evt) {
	let receivedSignal = Buffer.from(evt).toString('hex');
	log.test('--> Received signal:', receivedSignal);
} 
