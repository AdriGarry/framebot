#!/usr/bin/env node

'use strict';

const startTime = new Date();
console.log('\u2022');

const argv = process.argv;
console.log('argv', argv);
const name = process.argv[2];
const forcedParams = {
  debug: argv.includes('debug'),
  sleep: argv.includes('sleep'),
  test: argv.includes('test')
};

global._PATH = __dirname.match(/\/.*\//g)[0];

const fs = require('fs');
console.log('\n' + fs.readFileSync('./bots/' + argv[2] + '/logo.txt', 'utf8').toString());

const descriptor = require(_PATH + 'bots/' + name + '/descriptor.json');

const Core = require('./core/Core').initializeContext(descriptor, forcedParams, startTime);

const Flux = require('./api/Flux');
const Logger = require('./api/Logger');

const log = new Logger(__filename, Core.conf('mode'));

const Utils = require('./api/Utils'),
  Files = require('./api/Files'),
  Scheduler = require('./api/Scheduler');

const botName = Core.const('name').charAt(0).toUpperCase() + Core.const('name').slice(1);
const framebotVersion = Core.const('version');
log.info('--> ' + botName + ' is ready in version ' + framebotVersion + '! [' + Utils.executionTime(Core.startTime) + 'ms]');

Scheduler.delay(2).then(() => {
  log.table(Core.const(), 'CONST');
});

////////  TEST section  ////////
if (Core.conf('mode') === 'test') {
  setTimeout(function () {
    Flux.do('interface|tts|speak', { lg: 'en', msg: 'Integration tests sequence' });
    const integrationTests = require('./test/integration/tests');
    integrationTests.launch();
  }, 1000);
}
