#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'ssh', fn: showSshConnections },
  { id: 'all', fn: showConnections }
];

Observers.attachFluxParseOptions('service', 'netstat', FLUX_PARSE_OPTIONS);

const LOCAL_CONNECTIONS_PATTERNS_REGEX = new RegExp(/192\.168.*|serv.*|locale.*/);

setImmediate(() => {
  showConnections();
});

function showSshConnections() {
  showConnections(22);
}

function showConnections(port = '*') {
  Utils.execCmd(getNetstatCommand(port))
    .then(data => {
      logNetstatResult(data, port);
    })
    .catch(err => Core.error('showConnections Error', err));
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
