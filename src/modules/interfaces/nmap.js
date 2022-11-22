#!/usr/bin/env node

'use strict';

const nmap = require('node-nmap');
nmap.nmapLocation = 'nmap';

const { Core, Flux, Files, Logger, Observers } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'scan', fn: scan },
  { id: 'continuous', fn: startContinuousScan },
  { id: 'stop', fn: stopContinuousScan }
];

Observers.attachFluxParseOptions('interface', 'nmap', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  scan();
});

const LOCAL_NETWORK_RANGE = '192.16' + '8.1.0/24',
  INACTIVE_HOST_DELAY = 2 * 60 * 1000,
  DEFAULT_FORGET_DELAY = 60 * 60 * 1000;

let detectedHostsMap = new Map(
  Core.descriptor.knownHosts.map(host => {
    host['lastDetect'] = null;
    host['active'] = false;
    return [host.hostname, host];
  })
);

let quickScan,
  isContinuousScan = false;

function scan() {
  quickScan = new nmap.QuickScan(LOCAL_NETWORK_RANGE);
  quickScan.on('complete', hosts => {
    parseDetectedHosts(hosts, quickScan.scanTime);
    if (isContinuousScan) scan();
  });

  quickScan.on('error', error => {
    log.debug('Nmap error:', error);
    scan();
  });

  Core.run('presenceHosts', []);
  log.debug('Nmap scan...');
  quickScan.startScan();
}

function parseDetectedHosts(detectedHosts, scanTime) {
  log.debug(`Nmap detectect hosts in ${scanTime}ms:`, detectedHosts);
  let hostsToReact = [];
  detectedHosts.forEach(detectedHost => {
    if (!detectedHost.hostname) return log.debug('Hostnames not provided, skipping this scan result.');

    if (!detectedHostsMap.has(detectedHost.hostname)) {
      const newlyDetectedHost = {
        hostname: detectedHost.hostname,
        label: detectedHost.vendor || '',
        ip: detectedHost.ip,
        lastDetect: new Date(),
        active: true,
        unknown: true
      };
      detectedHostsMap.set(detectedHost.hostname, newlyDetectedHost);
      hostsToReact.push(newlyDetectedHost);
    } else {
      let alreadyDetectedHost = detectedHostsMap.get(detectedHost.hostname);
      const hasNotBeenDetectedForMoreThanOneHour = !alreadyDetectedHost.lastDetect || new Date() - alreadyDetectedHost.lastDetect > DEFAULT_FORGET_DELAY;
      if (hasNotBeenDetectedForMoreThanOneHour) {
        hostsToReact.push(alreadyDetectedHost);
      }
      alreadyDetectedHost.active = true;
      alreadyDetectedHost.lastDetect = new Date();
      alreadyDetectedHost.ip = detectedHost.ip;
      detectedHostsMap.set(detectedHost.hostname, alreadyDetectedHost);
    }
  });

  if (hostsToReact.length) {
    log.info(
      'New host(s) on network:',
      hostsToReact.map(host => host.hostname)
    );
    newHostReaction(hostsToReact);
  } else if (!isContinuousScan) {
    logTableActiveHosts();
  }

  disableInactiveHosts();
}

function disableInactiveHosts() {
  detectedHostsMap.forEach(host => {
    if (new Date() - host.lastDetect > INACTIVE_HOST_DELAY) host.active = false;
  });
}

function newHostReaction(hostsToReact) {
  let unknownHosts = [],
    presenceHosts = [];
  hostsToReact.forEach(host => {
    if (host.unknown) {
      unknownHosts.push(host);
    } else {
      if (host.label.toUpperCase().includes('ADRI') || host.label.toUpperCase().includes('CAM_PC')) presenceHosts.push(host.label);

      if (Array.isArray(host.flux)) {
        host.flux.forEach(flux => {
          Flux.do(flux.id, flux.value);
        });
      } else if (host.flux) {
        Flux.do(host.flux.id, host.flux.value);
      }
    }
  });

  if (presenceHosts.length) Core.run('presenceHosts', presenceHosts);

  if (unknownHosts.length) logAndPersistUnknownHosts(unknownHosts);

  logTableActiveHosts();
}

function logAndPersistUnknownHosts(unknownHosts) {
  log.warn(
    'Unknown host(s) detected:',
    unknownHosts.map(host => host.hostname)
  );
  const unknownHostsNames = unknownHosts.map(host => host.hostname);
  Flux.do('interface|tts|speak', { lg: 'en', voice: 'mbrolaFr1', msg: 'New unknown device: ' + unknownHostsNames.join(', ') });
  Files.appendJsonFile(Core._LOG + Core.const('name') + '_unknownHostHistory.json', unknownHosts);
}

function logTableActiveHosts() {
  const hostsTable = convertMapToObjectWithIpAndLastDetectOnlyIfHostIsActive(detectedHostsMap);
  log.table(hostsTable, `${Object.keys(hostsTable).length} Hosts`);
}

function convertMapToObjectWithIpAndLastDetectOnlyIfHostIsActive(map) {
  let obj = {};
  for (const item of [...map]) {
    const [hostname, host] = item;
    if (host.active) obj[hostname] = { ip: host.ip, lastDetect: host.lastDetect };
  }
  return obj;
}

function startContinuousScan() {
  log.info('Starting continuous scan');
  Core.run('nmap', true);
  isContinuousScan = true;
  scan();
}

function stopContinuousScan() {
  if (Core.run('nmap')) log.info('Stopping continuous scan...');
  Core.run('nmap', false);
  isContinuousScan = false;
}
