#!/usr/bin/env node

'use strict';

const nmap = require('node-nmap');
nmap.nmapLocation = 'nmap';

const { Core, Flux, Logger, Observers, Scheduler, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '*/10 * * * * *', flux: { id: 'service|nmap|scan' } }]
  }
};

const FLUX_PARSE_OPTIONS = [{ id: 'scan', fn: scan }];

Observers.attachFluxParseOptions('service', 'nmap', FLUX_PARSE_OPTIONS);

// setImmediate(() => {
//   Scheduler.delay(2).then(scan());
// });

let hostsList = {},
  isScanning = false;

function scan() {
  if (isScanning) return;

  log.info('Nmap scan...'); // TODO debug level
  const quickscan = new nmap.QuickScan('192.168.1.0/24'); // Accepts array or comma separated string of NMAP acceptable hosts
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

  log.table(hostsList, `Hosts ${hosts.length}`);

  if (Object.keys(oldHostsList).length > 0 && Object.keys(newDetectedHostsList).length) {
    log.test('New device(s) on network:', Object.keys(newDetectedHostsList));
    new Flux('interface|tts|speak', { lg: 'en', voice: 'mbrolaFr1', msg: 'New device detected!' });
  }
}
