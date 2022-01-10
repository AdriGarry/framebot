#!/usr/bin/env node
'use strict';

const rfxcom = require('rfxcom');

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

const rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: Core.conf('log') == 'info' ? false : true });

module.exports = {};

Observers.attachFluxParser('interface', 'rfxcom', rfxcomHandler);

function rfxcomHandler(flux) {
  /*if (flux.id == 'send' && flux.value.device === 'plugB' && flux.value.value === false) {
		sendStatus(flux.value);
		new Flux('service|internetNetwork|strategy');
	} else if (flux.id == 'send' && flux.value.device === 'plugB' && flux.value.value === true) {
		sendStatus(flux.value);
		new Flux('service|internetNetwork|strategyOff');
	} else*/ if (flux.id == 'send') {
    sendStatus(flux.value);
  } else if (flux.id == 'toggleLock') {
    toggleLock(flux.value);
  } else {
    Core.error('unmapped flux in Rfxcom interface', flux, false);
  }
}

const DEVICE = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);
const DEVICE_LIST = Core.descriptor.rfxcomDevices;

var powerPlugStatus = {};
Object.keys(DEVICE_LIST).forEach(key => {
  powerPlugStatus[key] = { status: 'unknow' };
});
Core.run('powerPlug', powerPlugStatus);

rfxtrx.initialise(function () {
  Core.run('rfxcom', true);
  log.info('Rfxcom gateway ready', '[' + Utils.executionTime(Core.startTime) + 'ms]');

  rfxtrx.on('receive', function (evt) {
    new Flux('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
    parseReceivedSignal(Buffer.from(evt).toString('hex'));
  });

  rfxtrx.on('disconnect', function (evt) {
    log.warn('Rfxcom disconnected!', Buffer.from(evt).toString('hex'));
  });
});

function sendStatus(args) {
  if (!Core.run('rfxcom')) {
    new Flux('interface|tts|speak', { lg: 'en', msg: 'rfxcom not available' });
    log.warn('rfxcom gateway not available!');
    return;
  }
  log.debug('sendStatus', args);
  let deviceName = args.device,
    value = args.value;
  if (!DEVICE_LIST.hasOwnProperty(deviceName)) log.error('Unknown device:', deviceName);
  else {
    if (value) DEVICE.switchOn(DEVICE_LIST[deviceName].id);
    else DEVICE.switchOff(DEVICE_LIST[deviceName].id);
    Core.run('powerPlug.' + deviceName, { status: value ? 'on' : 'off' });
  }
}

const PLUG_STATUS_REMOTE_COMMAND_REGEX = new RegExp(/01f4bf8e0(?<plugId>.)(?<positiveValue>010f60)?/);

function parseReceivedSignal(receivedSignal) {
  // TODO Not working, check regex...
  log.info('Rfxcom receive:', receivedSignal);

  let matchPlug = PLUG_STATUS_REMOTE_COMMAND_REGEX.exec(receivedSignal);
  if (matchPlug) {
    let plugId = matchPlug.groups.plugId;
    let value = matchPlug.groups.positiveValue;
    log.debug('parseReceivedSignal', plugId, value);
    let deviceName;
    Object.keys(DEVICE_LIST).forEach(device => {
      if (DEVICE_LIST[device].id.substr(DEVICE_LIST[device].id.length - 1) == plugId) deviceName = device;
    });
    Core.run('powerPlug.' + deviceName, { status: value ? 'on' : 'off' });
  } else if (receivedSignal.indexOf('0008c8970a010f60') > -1) {
    new Flux('service|motionDetectAction|on');
  } else if (receivedSignal.indexOf('0008c8970a000060') > -1) {
    new Flux('service|motionDetectAction|off');
  }
}

function toggleLock(lockValue) {
  if (lockValue) {
    if (Core.run('rfxcom')) log.info('Rfccom gateway already available');
    else log.info('Rfccom gateway unlocked!');
  } else {
    if (Core.run('rfxcom')) log.info('Rfccom gateway locked!');
    else log.info('Rfccom gateway already locked');
  }
  Core.run('rfxcom', lockValue);
}
