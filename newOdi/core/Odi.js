#!/usr/bin/env node
'use strict'

var log = new (require(ODI_PATH + 'core/logger.js'))(__filename);
// var conf = require('/home/pi/odi/conf.json');

var root;
var Odi = {
    // config: require('/home/pi/odi/conf.json'),
    //conf: require('/home/pi/odi/conf.json'),
    debug: 1,
    // watch:watch,
    error: error,
    ODI_PATH: root,
    CORE_PATH: ODI_PATH + 'core/',
    CONFIG_FILE: ODI_PATH + 'conf.json',
    DATA_PATH: ODI_PATH + 'data/',
    LOG_PATH: ODI_PATH + 'log/',
    WEB_PATH: ODI_PATH + 'web/',
    TMP_PATH: ODI_PATH + 'tmp/'
};
console.log('-->Odi');
console.log(Odi);

module.exports = {
    init: init,
    Odi: Odi
};

// function Odi(){
//     console.log(this);
//     this.conf = ;
//     this.debug = 1;
//     this.watch = watch;
//     this.error = error;
//     this.ODI_PATH = root;
//     this.CORE_PATH = ODI_PATH + 'core/';
//     this.CONFIG_FILE = ODI_PATH + 'conf.json';
//     this.DATA_PATH = ODI_PATH + 'data/';
//     this.LOG_PATH = ODI_PATH + 'log/';
//     this.WEB_PATH = ODI_PATH + 'web/';
//     this.TMP_PATH = ODI_PATH + 'tmp/';
//     return this;
// }
function init(path){
    // log.info('init ODI MAIN OBJECT', path);
    root = path;
    console.log(root);
    return Odi;
};

function error(){
    log.error(arguments);
    console.trace()
    // TODO ring & blink
};

function watch(arg){
    log.debug('watch()', arg);
}

console.log('TEMOIN Odi.js');
log.debug('TEMOIN Odi.js');

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