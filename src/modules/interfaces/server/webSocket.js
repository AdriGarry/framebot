#!/usr/bin/env node

const WebSocket = require('ws'),
   Tail = require('tail').Tail;

const { Core, Logger } = require('./../../../api');

const log = new Logger(__filename);

module.exports = {
   init: init
};

const LOG_FILE = Core._LOG + Core.const('name') + '.log';

function init(server) {
   const ws = new WebSocket.Server({ server });
   logTailWebSocket(ws);
   log.debug('Web socket ready for connection...');
   return server;
}

function logTailWebSocket(ws) {
   ws.on('connection', function (client) {
      log.info('logTail web socket client connected');

      client.on('message', function incoming(message) {
         log.info('WS received:', message);
      });

      let tail = new Tail(LOG_FILE);

      tail.on("line", function (data) {
         client.send(JSON.stringify({ topic: 'logTail', data: data }));
      });

      tail.on("error", function (error) {
         Core.error('log tail ERROR: ', error);
      });

   });

   ws.on('close', function close() {
      log.warn('logTail web socket disconnected');
   });
}

