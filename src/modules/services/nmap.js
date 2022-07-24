#!/usr/bin/env node

'use strict';

const nmap = require('node-nmap');
nmap.nmapLocation = 'nmap';

const { Core, Flux, Logger, Observers, Utils } = require('../../api');

const log = new Logger(__filename);

// module.exports = {
//   cron: {
//     full: [{ cron: '0 0 * * * *', flux: { id: 'service|time|now' } }]
//   }
// };

const FLUX_PARSE_OPTIONS = [
  { id: 'scan', fn: scan } // TODO
];

Observers.attachFluxParseOptions('service', 'nmap', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  scan();
});

const quickscan = new nmap.QuickScan('192.168.1.0/24'); // Accepts array or comma separated string of NMAP acceptable hosts

function scan() {
  quickscan.on('complete', data => {
    log.test(data);
  });

  quickscan.on('error', error => {
    log.error('Nmap scan error', error);
  });

  quickscan.startScan();
}
