#!/usr/bin/env node
'use strict'

var log = new (require(ODI_PATH + 'core/Logger.js'))(__filename);
// var conf = require('/home/pi/odi/conf.json');

var Odi = {
    conf: require(ODI_PATH + 'conf.json'),
    setup: {}, // forcedMode, clockMode, alarms...
    stats: {},// update, totalLines, diskSpace...
    debug: 0,
    // watch:watch,
    error: error,
    ODI_PATH: '',
    CORE_PATH: ODI_PATH + 'core/',
    CONFIG_FILE: ODI_PATH + 'conf.json',
    DATA_PATH: ODI_PATH + 'data/',
    LOG_PATH: ODI_PATH + 'log/',
    WEB_PATH: ODI_PATH + 'web/',
    TMP_PATH: ODI_PATH + 'tmp/'
};

module.exports = {
    init: init,
    Odi: Odi
};

function init(path) { // Deprecated ?
    Odi.PATH = path;
    // log.info('Odi context initializing', Odi.conf.debug, Odi.conf.debug ? 'debug mode' : '');
    log.info('Odi initializing...');
    return Odi;
};

// var Flux = require(Odi.CORE_PATH + 'Flux.js');


function error() {
    log.error(arguments);
    log.error(console.trace());
    // TODO ring & blink
};

function watch(arg) {
    log.debug('watch()', arg);
}

// console.log(log);
// log.info('TEMOIN Odi [info].js');
log.debug('TEMOIN Odi [debug].js');
