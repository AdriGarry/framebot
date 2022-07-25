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

const LOCAL_NETWORK_RANGE = '192.168.1.0/24',
  NMAP_JOB = new CronJobList([{ cron: '*/10 * * * * *', flux: { id: 'service|nmap|scan' } }], 'nmap', true);

const KNOWN_HOSTS = { ADRI: 'Pixel-3a', CAMILLE: 'TODO', ADRI_PC: 'adri-pc', ODI: 'raspberrypi', BBOX: 'bbox.lan', OLD_ANDROID: 'android-38594d3ba13a4305' }; //TODO move to descriptor ?

let hostsList = {},
  isScanning = false;

function scan() {
  if (isScanning) return log.info('Already scanning...');

  log.info('Nmap scan...');
  const quickscan = new nmap.QuickScan(LOCAL_NETWORK_RANGE); // Accepts array or comma separated string of NMAP acceptable hosts
  isScanning = true;

  quickscan.on('complete', hosts => {
    isScanning = false;
    parseSuppliedHosts(hosts);
  });

  quickscan.on('error', error => {
    isScanning = false;
    log.error('Nmap scan error', error);
  });

  quickscan.startScan();
}

function parseSuppliedHosts(hosts) {
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

  if (Object.keys(oldHostsList).length > 0 && Object.keys(newDetectedHostsList).length) {
    // TODO move all code bellow to a new function...
    log.info('New host(s) on network:', Object.keys(newDetectedHostsList));
    new Flux('interface|tts|speak', { lg: 'en', voice: 'mbrolaFr1', msg: 'New host: ' + Object.keys(newDetectedHostsList).join(', ') });
    // TODO do not play this generic TTS if known host, only for unknown devices...
    let firstKnownHost = getFirstKnownHost(newDetectedHostsList);
    log.test('firstKnownHost:', firstKnownHost); // TODO remove this
    if (firstKnownHost === KNOWN_HOSTS.ADRI) {
      new Flux('interface|tts|speak', { msg: 'Oh! Salut Adri!' });
    }
  }
}

function getFirstKnownHost(newDetectedHostsList) {
  let matchingHost = null;
  Object.keys(newDetectedHostsList).forEach(key => {
    Object.keys(KNOWN_HOSTS).forEach(key2 => {
      if (key === KNOWN_HOSTS[key2]) {
        matchingHost = KNOWN_HOSTS[key2];
        return;
      }
      if (matchingHost) return;
    });
  });
  return matchingHost;
}

function scanLoop() {
  log.info('Starting scanLoop...');
  Core.run('nmap', true);
  NMAP_JOB.start();
}

function stopScanLoop() {
  NMAP_JOB.stop();
  Core.run('nmap', false);
  log.info('ScanLoop stopped.');
}
