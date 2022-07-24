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

let isScanning = false;

function scan() {
  if (isScanning) return;

  log.info('scanning network...');
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
  log.info('parseSuppliedHosts', hosts.length);
  log.test(hosts);
}
