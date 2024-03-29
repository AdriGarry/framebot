#!/usr/bin/env node

'use strict';

const dns = require('dns'),
  os = require('os');

const { Core, Logger, Observers, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '20 5 * * * *', flux: { id: 'service|network|netstat' } }]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'netstat', fn: logNetstat },
  { id: 'testConnection', fn: testConnectionTwice }
];

Observers.attachFluxParseOptions('service', 'network', FLUX_PARSE_OPTIONS);

const LOCAL_CONNECTIONS_PATTERNS_REGEX = new RegExp(/192\.168.*|serv.*|locale.*/);

const DELAY_BEFORE_RETRY = 60 * 1000;

let isOnline,
  isRetrying = false;

setImmediate(() => {
  logNetstat();
  testConnectionTwice();
  Core.run('network.local', getLocalIp());
});

setInterval(() => {
  testConnectionTwice();
}, DELAY_BEFORE_RETRY);

function testConnectionTwice() {
  testConnection()
    .then(onlineCallback)
    .catch(() => {
      isRetrying = true;
      log.info('Internet connection test failed, retrying...');
      testConnection().then(onlineCallback).catch(notConnectedCallback);
    });
}

function logNetstat(port = '*') {
  Utils.execCmd(getNetstatCommand(port))
    .then(data => {
      logNetstatResult(data, port);
    })
    .catch(err => Core.error('logNetstat Error', err));
}

function logNetstatResult(result, port) {
  let lines = result.trim().split('\n');
  let output = {};
  for (const line of lines) {
    const splitted = line.trim().split(' ');
    output[splitted[1]] = splitted[0];
  }

  log.table(output, 'Netstat: ' + port);

  for (const line in output) {
    if (isNotLocalConnection(line)) {
      log.warn(`${output[line]} external connection(s) [${line}]`);
    }
  }

  function isNotLocalConnection(line) {
    return !line.match(LOCAL_CONNECTIONS_PATTERNS_REGEX);
  }
}

function getNetstatCommand(port) {
  return `/usr/bin/netstat -tn 2>/dev/null | grep :${port} | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head`;
}

function onlineCallback() {
  if (!isOnline || isRetrying) {
    log.info("I'm on the internet!");
    getPublicIp().then(ip => Core.run('network.public', ip));
  }
  isRetrying = false;
  isOnline = true;
}

function notConnectedCallback(err) {
  if (isOnline) {
    log.warn();
    log.warn("I've lost my internet connection!");
    Core.run('network.public', 'offline');
  }
  isOnline = false;
}

/** Function to test internet connection */
function testConnection() {
  let execTime = new Date();
  return new Promise((resolve, reject) => {
    dns.lookup('adrigarry.com', function (err) {
      if (err && err.code == 'ENOTFOUND') {
        log.debug('test connexion failed in', Utils.executionTime(execTime) + 'ms');
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function getLocalIp() {
  let ifaces = os.networkInterfaces(),
    localIp = '';
  Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0;
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        // console.log(ifname + ':' + alias, iface.address);
        localIp += ifname + ':' + alias + ' ' + iface.address;
      } else {
        // this interface has only one ipv4 adress
        localIp = iface.address;
      }
      ++alias;
    });
  });
  return localIp;
}

function getPublicIp() {
  return new Promise((resolve, reject) => {
    Utils.execCmd('/usr/bin/curl icanhazip.com', true)
      .then(data => {
        resolve(data.trim());
      })
      .catch(err => {
        log.warn("Can't retreive public IP " + err);
        reject(err);
      });
  });
}
