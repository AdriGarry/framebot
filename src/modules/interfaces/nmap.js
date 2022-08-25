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
  DEFAULT_FORGET_DELAY = 60 * 1000; // TODO 60 * 60 * 1000

const KNOWN_HOSTS = new Array(Core.descriptor.knownHosts.map(host => host.hostname));

log.test(KNOWN_HOSTS);

let detectedHostsMap = new Map(
  Core.descriptor.knownHosts.map(host => {
    host['lastDetect'] = null;
    return [host.hostname, host];
  })
);

let quickScan,
  isContinuousScan = false;

function scan() {
  quickScan = new nmap.QuickScan(LOCAL_NETWORK_RANGE);
  quickScan.on('complete', hosts => {
    parseDetectedHosts(hosts);
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

function parseDetectedHosts(detectedHosts) {
  let hostsToReact = [];

  detectedHosts.forEach(detectedHost => {
    if (!detectedHostsMap.has(detectedHost.hostname)) {
      const newlyDetectedHost = {
        hostname: detectedHost.hostname,
        label: detectedHost.vendor || '',
        ip: detectedHost.ip,
        lastDetect: new Date(),
        unknown: true
      };
      detectedHostsMap.set(detectedHost.hostname, newlyDetectedHost);
      hostsToReact.push(newlyDetectedHost);
    }
    let alreadyDetectedHost = detectedHostsMap.get(detectedHost.hostname);
    const hasNotBeenDetectedForMoreThanOneHour = !alreadyDetectedHost.lastDetect || new Date() - alreadyDetectedHost.lastDetect > DEFAULT_FORGET_DELAY;
    if (hasNotBeenDetectedForMoreThanOneHour) {
      hostsToReact.push(alreadyDetectedHost);
    }
    alreadyDetectedHost.lastDetect = new Date();
    alreadyDetectedHost.ip = detectedHost.ip;
    detectedHostsMap.set(detectedHost.hostname, alreadyDetectedHost);
  });

  if (hostsToReact.length) {
    log.info(
      'New host(s) on network:',
      hostsToReact.map(host => host.hostname)
    );
    newHostReaction(hostsToReact);
    // log.table(hostsList, `${Object.keys(hostsList).length} Hosts`); // TODO deals with toString() method of Map
  }
}

function newHostReaction(hostsToReact) {
  let unknownHosts = [];
  hostsToReact.forEach(host => {
    if (host.unknown) {
      unknownHosts.push(host);
    } else if (Array.isArray(host.flux)) {
      host.flux.forEach(flux => {
        new Flux(flux.id, flux.value);
      });
    } else if (host.flux) {
      new Flux(host.flux.id, host.flux.value);
    }
  });

  if (unknownHosts.length > 0) {
    log.warn('Unknown host(s) detected:', unknownHosts);
    const unknownHostsNames = unknownHosts.map(host => host.hostname);
    new Flux('interface|tts|speak', { lg: 'en', voice: 'mbrolaFr1', msg: 'New unknown device: ' + unknownHostsNames.join(', ') });
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
