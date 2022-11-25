#!/usr/bin/env node

const { WebSocketServer } = require('ws'),
  Tail = require('tail').Tail;

const { Core, Logger, Flux } = require('./../../../api');

const log = new Logger(__filename);

module.exports = {
  init: init
};

const LOG_FILE = Core._LOG + Core.const('name') + '.log';

let wss;

function init(server) {
  wss = new WebSocketServer({ server });
  logTailWebSocket(wss);
  log.debug('Web socket ready for connection');
  return server;
}

function logTailWebSocket(wss) {
  wss.on('connection', function (ws, req) {
    newWebsocketClient(ws, req);
    Core.run('wsClients', wss.clients.size);

    let wsInterval = setInterval(() => {
      log.info('Active websocket client(s):', wss.clients.size);
      Core.run('wsClients', wss.clients.size);
      if (!wss.clients.size) clearInterval(wsInterval);
    }, 60 * 1000);
  });

  wss.on('close', function close() {
    log.info('logTail web socket disconnected', wss);
  });
}

function newWebsocketClient(ws, req) {
  log.info('new logTail web socket client connected', req.socket.remoteAddress);

  let tail = new Tail(LOG_FILE);
  tail.on('line', function (data) {
    ws.send(JSON.stringify({ topic: 'logTail', data: data }));
  });

  ws.on('message', function incoming(message) {
    log.info('WS received:', message);
  });

  tail.on('error', function (error) {
    Core.error('log tail ERROR: ', error);
  });
}
