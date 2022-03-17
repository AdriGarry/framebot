#!/usr/bin/env node

'use strict';

const dns = require('dns'),
  os = require('os');

const { Core, CronJobList, Logger, Observers, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    base: [{ cron: '20 5 * * * *', flux: { id: 'service|netstat|all' } }]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'strategy', fn: internetBoxStrategy },
  { id: 'strategyOff', fn: internetBoxStrategyOff },
  { id: 'netstat', fn: logNetstat }
];

Observers.attachFluxParseOptions('service', 'network', FLUX_PARSE_OPTIONS);

const LOCAL_CONNECTIONS_PATTERNS_REGEX = new RegExp(/192\.168.*|serv.*|locale.*/);

const INTERNET_BOX_STRATEGY_CRON = [
    { cron: '0 55 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: true } } },
    { cron: '0 10 * * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: false } } }
  ],
  internetBoxStrategyCrons = new CronJobList(INTERNET_BOX_STRATEGY_CRON, 'internetBoxOffStrategy', true);

const DELAY_BEFORE_RETRY = 60 * 1000;

var isOnline,
  isRetrying = false;

setImmediate(() => {
  logNetstat();
  Core.run('network.local', getLocalIp());
});

var internetTestInterval = setInterval(() => {
  testConnection()
    .then(onlineCallback)
    .catch(() => {
      isRetrying = true;
      log.info('Internet connection test failed, retrying...');
      testConnection().then(onlineCallback).catch(notConnectedCallback);
    });
}, DELAY_BEFORE_RETRY);

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
  return `netstat -tn 2>/dev/null | grep :${port} | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head`;
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

/** Function to get connected from 0 to 10 min of each hour */
function internetBoxStrategy() {
  log.info('Starting internet box strategy...');
  internetBoxStrategyCrons.start();
}

function internetBoxStrategyOff() {
  // TODO problem: parse receive from rfxcom instead of flux filter
  // TODO test internetBoxStrategyCrons.nextDate value in more than 15 min ?
  log.info('internetBoxStrategyOff', internetBoxStrategyCrons.nextDate());
  if (false) {
    log.info('Stopping internet box strategy');
    internetBoxStrategyCrons.stop();
    clearInterval(internetTestInterval);
  }
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
    Utils.execCmd('curl icanhazip.com')
      .then(data => {
        resolve(data.trim());
      })
      .catch(err => {
        log.warn("Can't retreive public IP " + err);
        reject(err);
      });
  });
}
