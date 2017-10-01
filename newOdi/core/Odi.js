#!/usr/bin/env node
'use strict'

var log = new (require(ODI_PATH + 'core/logger.js'))(__filename);
// var conf = require('/home/pi/odi/conf.json');

var Odi = {
    conf: require('/home/pi/odi/conf.json'),
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

function init(path){ // Deprecated ?
    Odi.PATH = path;
    log.info('Odi context initializing', Odi.conf.debug, Odi.conf.debug ? 'debug mode':'');
    return Odi;
};

// var Flux = require(Odi.CORE_PATH + 'Flux.js');


function error(){
    log.error(arguments);
    log.error(console.trace());
    // TODO ring & blink
};

function watch(arg){
    log.debug('watch()', arg);
}

// console.log('TEMOIN Odi.js');
// console.log(log);
log.info('TEMOIN Odi [info].js');
log.debug('TEMOIN Odi [debug].js');

/*
/// GpioDefinitions.js
/// This is where we define all our gpio addresses
var gpioAddresses = {}; 
gpioAddresses.buttons = {
"okPin": 20,
"cancelPin": 24
}; 
gpioAddresses.leds = {
    // ...
}; 

module.exports = gpioAddresses;
// -------------------------------
/// UiElements.js
/// Implements define our ui elements based on gpio hardware
var gpioAddresses = require('./gpioAddresses');
// C'est parti pour la creation des objets buttons et leds
module.exports = uiElements;
// --------------------------------
/// View.js
var uiElements = require('./UiElements');
var eventHandlers = require('./EventHandlers');

var view = new View(uiElements, eventHandlers);
// represente l'etat par defaut sur le hardware
var defaultRobotState = {
      "warningLedState": "blinking",
      "dickIsUp": false
}
view.initState(robotState);*/