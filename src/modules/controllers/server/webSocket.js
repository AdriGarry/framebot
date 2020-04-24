#!/usr/bin/env node

const { spawn } = require('child_process'),
   fs = require('fs'),
   http = require('http'),
   socketIo = require('socket.io');

const Core = require('../../../core/Core').Core;

const Logger = require('../../../api/Logger'),
   Utils = require('../../../api/Utils');

const log = new Logger(__filename);

module.exports = {
   init: init
};

const LOG_FILE = Core._LOG + Core.name + '/' + Core.name + '.log';

function init(server) {
   let io = socketIo.listen(server);
   io.on('connection', function (client) {
      log.test('Web socket client connected');
      let tail = spawn("tail", ["-f", LOG_FILE]);
      client.send({ filename: LOG_FILE });

      tail.stdout.on("data", function (data) {
         log.test(data.toString('utf-8'))
         client.send({ tail: data.toString('utf-8') })
      });
   });
   log.info('Web socket ready for connection...');
}
