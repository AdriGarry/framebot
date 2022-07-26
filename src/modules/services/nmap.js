#!/usr/bin/env node

'use strict';

const nmap = require('node-nmap');
nmap.nmapLocation = 'nmap';

const { Core, CronJobList, Flux, Logger, Observers, Scheduler, Utils } = require('../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
  { id: 'scan', fn: scan },
  { id: 'scanLoop', fn: scanLoop },
  { id: 'stopScanLoop', fn: stopScanLoop }
];

Observers.attachFluxParseOptions('service', 'nmap', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  Scheduler.delay(2).then(scan());
});

const SCAN_CRON = '*/10 * * * * *',
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

const LOCAL_NETWORK_RANGE = '192.16' + '8.1.0/24',
  NMAP_JOB = new CronJobList([{ cron: SCAN_CRON, flux: { id: 'service|nmap|scan' } }], 'nmap', true);

let hostsList = {},
  isScanning = false;

function scan() {
  if (isScanning) return log.info('Already scanning...');

  let quickScan = new nmap.QuickScan(LOCAL_NETWORK_RANGE); // Accepts array or comma separated string of NMAP acceptable hosts
  quickScan.on('complete', hosts => {
    isScanning = false;
    parseFoundHosts(hosts);
  });

  quickScan.on('error', error => {
    isScanning = false;
    log.error('Nmap error:', error);
  });

  isScanning = true;
  log.info('Nmap scan...');
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

  log.table(hostsList, `${hosts.length} Hosts`);

  let newDetectedHosts = Object.keys(newDetectedHostsList);
  if (Object.keys(oldHostsList).length > 0 && newDetectedHosts.length) {
    log.info('New host(s) on network:', newDetectedHosts);
    newHostReaction(newDetectedHosts);
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
        log.info('New known host:', host);
        break;
      default:
        unknownHosts.push(host);
        break;
    }
  });
  if (unknownHosts.length > 0) new Flux('interface|tts|speak', { lg: 'en', voice: 'mbrolaFr1', msg: 'New unknown host: ' + unknownHosts.join(', ') });
}

function scanLoop() {
  log.info('Starting scanLoop...');
  Core.run('nmap', true);
  NMAP_JOB.start();
  setTimeout(() => {
    log.info('Scan loop timeout!');
    stopScanLoop();
  }, 2 * 60 * 60 * 1000);
}

function stopScanLoop() {
  NMAP_JOB.stop();
  Core.run('nmap', false);
  log.info('ScanLoop stopped.');
}
