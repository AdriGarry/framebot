#!/usr/bin/env node
'use strict'

const ODI_PATH = '/home/pi/odi/core3/';

/** Odi's paths */
module.exports = {
    ODI_PATH: ODI_PATH,
    CORE_PATH: ODI_PATH + 'core/',
    CONFIG_FILE: ODI_PATH + 'conf.json',
    DATA_PATH: ODI_PATH + 'data/',
    LOG_PATH: ODI_PATH + 'log/',
    WEB_PATH: ODI_PATH + 'web/',
    TMP_PATH: ODI_PATH + 'tmp/'
};

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