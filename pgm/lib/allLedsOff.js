#!/usr/bin/env node

var Gpio = require('onoff').Gpio;

var gpioPins = require('./gpioPins.js');
var gpioPinsInstance = new gpioPins();

console.log('All Leds OFF');

led.write(0);
eye.write(0);
belly.write(0);
satellite.write(0);
