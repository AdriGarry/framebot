#!/usr/bin/env node

var Gpio = require('onoff').Gpio;

var gpioPins = require('./gpioPins.js');
var gpioPinsInstance = new gpioPins();

console.log('All Leds ON');

led.write(1);
eye.write(1);
belly.write(1);
satellite.write(1);
