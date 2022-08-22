#!/usr/bin/env node

'use strict';

const nmap = require('node-nmap');
nmap.nmapLocation = 'nmap';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'scan', fn: scan },
  { id: 'continuous', fn: continuousScan },
  { id: 'stop', fn: stopContinuousScan }
];

Observers.attachFluxParseOptions('interface', 'nmap', FLUX_PARSE_OPTIONS);

const LOCAL_NETWORK_RANGE = '192.16' + '8.1.0/24',
  KNOWN_HOSTS = {
    ADRI: 'Pixel-3a',
    ADRI_PC: 'adri-pc',
    ADRI_PC_WORK: 'ENOVACOM-AGAR2-001',
    BBOX: 'bbox.lan',
    CAM: 'TODO',
    CAM_PC: 'TODO',
    ODI: 'raspberrypi',
    OLD_ANDROID: 'android-38594d3ba13a4305',
    NULL: 'null'
  }; //TODO move to descriptor ?

let quickScan;
let hostsList = {},
  isContinuousScan = false;

function scan() {
  quickScan = new nmap.QuickScan(LOCAL_NETWORK_RANGE);
  quickScan.on('complete', hosts => {
    parseFoundHosts(hosts);
    if (isContinuousScan) scan();
    else log.table(hosts, `${hosts.length} Hosts`);
  });

  quickScan.on('error', error => {
    log.error('Nmap error:', error);
    if (isContinuousScan) scan();
  });

  log.debug('Nmap scan...');
  quickScan.startScan();
}

function parseFoundHosts(hosts) {
  let oldHostsList = hostsList,
    newDetectedHostsList = {};
  hostsList = {};

  hosts.forEach(host => {
    if (!oldHostsList.hasOwnProperty(host.hostname)) {
      newDetectedHostsList[host.hostname] = host.ip;
    }
    hostsList[host.hostname] = host.ip;
  });

  let newDetectedHosts = Object.keys(newDetectedHostsList);
  if (Object.keys(newDetectedHosts).length && Object.keys(oldHostsList).length) {
    log.info('New host(s) on network:', newDetectedHosts);
    newHostReaction(newDetectedHosts);
    log.table(hostsList, `${Object.keys(hostsList).length} Hosts`);
  }
}

function newHostReaction(newDetectedHosts) {
  let unknownHosts = [];
  newDetectedHosts.forEach(host => {
    switch (host) {
      case KNOWN_HOSTS.ADRI:
        new Flux('interface|tts|speak', { msg: 'Oh! Salut Adri!' });
        break;
      case KNOWN_HOSTS.ADRI_PC:
      // case KNOWN_HOSTS.CAM:
      // case KNOWN_HOSTS.CAM_PC:
      case KNOWN_HOSTS.BBOX:
      case KNOWN_HOSTS.ODI:
      case KNOWN_HOSTS.OLD_ANDROID:
      case KNOWN_HOSTS.NULL:
        break;
      default:
        unknownHosts.push(host);
        break;
    }
  });
  if (unknownHosts.length > 0) {
    log.warn('Unknown host detected:', newDetectedHosts);
    new Flux('interface|tts|speak', { lg: 'en', voice: 'mbrolaFr1', msg: 'New unknown device: ' + unknownHosts.join(', ') });
  }
}

function continuousScan() {
  log.info('Starting continuous scan for 1 hour...');
  Core.run('nmap', true);
  isContinuousScan = true;
  setTimeout(() => {
    log.info('Continuous scan timeout, stopping...');
    stopContinuousScan();
  }, 60 * 60 * 1000);
  scan();
}

function stopContinuousScan() {
  log.debug('Stopping continuous scan...');
  Core.run('nmap', false);
  isContinuousScan = false;
}
