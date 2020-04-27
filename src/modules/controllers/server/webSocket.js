#!/usr/bin/env node

const { spawn } = require('child_process'),
   fs = require('fs'),
   http = require('http'),
   WebSocket = require('ws');

const Core = require('../../../core/Core').Core;

const Logger = require('../../../api/Logger'),
   Utils = require('../../../api/Utils');

const log = new Logger(__filename);

module.exports = {
   init: init
};

const LOG_FILE = Core._LOG + Core.name + '/' + Core.name + '.log';

function init(server) {
   log.test('init webSocket')
   const ws = new WebSocket.Server({ server });
   ws.on('connection', function (client) {
      log.test('Web socket client connected');

      client.on('message', function incoming(message) {
         log.test('WS received:', message);
      });


      client.send('logTail', 'logs...');

      let logTail = fs.watch(LOG_FILE);

      logTail.stdout.on('data', function (logs) {
         log.test(logs.toString('utf-8'))
         client.send({ topic: 'logTail', data: logs.toString('utf-8') })
      });

      // let logTail = spawn('tail', ['-f', LOG_FILE]);

      // logTail.stdout.on('data', function (logs) {
      //    log.test(logs.toString('utf-8'))
      //    client.send({ topic: 'logTail', data: logs.toString('utf-8') })
      // });

      // log.test(data.toString('utf-8'))


      // client.send('titi');
      // //client.send({ filename: LOG_FILE });

   });
   //server.listen(433);
   log.info('Web socket ready for connection...');
   return server;
}

