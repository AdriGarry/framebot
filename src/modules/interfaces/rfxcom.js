#!/usr/bin/env node
'use strict';

const rfxcom = require('rfxcom');

const { Core, Flux, Logger, Observers, Files, Scheduler, Utils } = require('./../../api');

const log = new Logger(__filename);

const rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: Core.conf('log') === 'info' });

module.exports = {};

Observers.attachFluxParser('interface', 'rfxcom', rfxcomHandler);

function rfxcomHandler(flux) {
  if (flux.id == 'send') {
    sendStatus(flux.value);
  } else if (flux.id == 'toggleLock') {
    toggleLock(flux.value);
  } else {
    Core.error('unmapped flux in Rfxcom interface', flux, false);
  }
}

const DEVICE = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);
const DEVICE_LIST = Core.descriptor.rfxcomDevices;
const SEC_TO_FORGET_PLUG_STATUS_FROM_CONF = 10;

let powerPlugStatus = {};
const isConfTrustable = Utils.getDifferenceInSec(Core.conf('_lastModified')) <= SEC_TO_FORGET_PLUG_STATUS_FROM_CONF;
Object.keys(DEVICE_LIST).forEach(key => {
  powerPlugStatus[key] = (isConfTrustable && Core.conf('rfxcomDevices.' + key)) || 'unknow';
});
Core.conf('rfxcomDevices', powerPlugStatus);

rfxtrx.initialise(function () {
  Core.run('rfxcom', true);
  Flux.do('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { log: 'trace' });
  log.info('Rfxcom gateway ready', '[' + Utils.executionTime(Core.startTime) + 'ms]');

  rfxtrx.on('receive', function (evt) {
    if (Core.run('rfxcom')) {
      Flux.do('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
      parseReceivedSignal(evt);
    }
  });

  rfxtrx.on('disconnect', function (evt) {
    log.warn('Rfxcom disconnected!', Buffer.from(evt).toString('hex'));
  });
});

function sendStatus(args) {
  if (!Core.run('rfxcom')) {
    Flux.do('interface|tts|speak', { lg: 'en', msg: 'rfxcom not available' });
    log.warn('Rfxcom gateway not available!');
    return;
  }
  log.debug('sendStatus', args);
  let deviceName = args.device,
    value = args.value;
  if (!DEVICE_LIST.hasOwnProperty(deviceName)) log.error('Unknown device:', deviceName);
  else {
    if (value) DEVICE.switchOn(buildSequence(deviceName));
    else DEVICE.switchOff(buildSequence(deviceName));
    Core.conf('rfxcomDevices.' + deviceName, { mode: value ? 'on' : 'off' });
  }
}

function buildSequence(deviceName) {
  return `0x${DEVICE_LIST[deviceName].family}/${getIdAsHex(deviceName)}`;
}

function getIdAsHex(deviceName) {
  return `${parseInt(DEVICE_LIST[deviceName].id, 16)}`;
}

const PLUG_STATUS_REMOTE_COMMAND_REGEX = new RegExp(/0[bB]\S{6}(?<plugFamily>\S{8})\S(?<plugId>\S)(?<positiveValue>010f[56]0)?/);
const MOTION_DETECT_SIGNAL = '0008c8970a010f',
  MOTION_DETECT_END_SIGNAL = '0008c8970a0000'; // TODO faire une regex qui gère les plug et le motion sensor

function parseReceivedSignal(receivedSignal) {
  let parsedReceivedSignal = Buffer.from(receivedSignal).toString('hex');
  log.debug('Rfxcom receive:', parsedReceivedSignal, receivedSignal);

  let matchPlug = PLUG_STATUS_REMOTE_COMMAND_REGEX.exec(parsedReceivedSignal);
  if (parsedReceivedSignal.indexOf(MOTION_DETECT_SIGNAL) > -1) {
    Flux.do('service|motionDetect|detect');
  } else if (parsedReceivedSignal.indexOf(MOTION_DETECT_END_SIGNAL) > -1) {
    Flux.do('service|motionDetect|end');
  } else if (matchPlug) {
    updateStatusForPlug(matchPlug);
  } else {
    log.warn('Unreconized rfxcom signal:', parsedReceivedSignal, receivedSignal);
    Files.appendJsonFile(Core._LOG + Core.const('name') + '_unreconizedRfxcomSignal.json', {
      signal: parsedReceivedSignal,
      date: new Date()
    });
  }
}

function updateStatusForPlug(matchPlug) {
  let plugFamily = matchPlug.groups.plugFamily;
  let plugId = matchPlug.groups.plugId;
  let value = matchPlug.groups.positiveValue;
  let deviceName = getDevice(plugFamily, plugId);
  if (deviceName) {
    Core.conf('rfxcomDevices.' + deviceName, { mode: value ? 'on' : 'off' });
    log.info(`Received plug signal parsed. PlugId: ${deviceName} [${plugId}], value: ${value ? true : false} [${value}]`);
  } else log.error('Unknow device: ' + deviceName, { plugFamily, plugId });
}

function getDevice(plugFamily, plugId) {
  for (const device in DEVICE_LIST) {
    if (plugFamily.toUpperCase() === DEVICE_LIST[device].family && plugId.toUpperCase() === DEVICE_LIST[device].id) {
      return device;
    }
  }
  return null;
}

function toggleLock(lockValue) {
  if (lockValue) {
    if (Core.run('rfxcom')) log.info('Rfccom gateway already available');
    else log.info('Rfccom gateway unlocked!');
  } else if (Core.run('rfxcom')) {
    log.info('Rfccom gateway locked!');
  } else log.info('Rfccom gateway already locked');
  Core.run('rfxcom', lockValue);
}
