#!/usr/bin/env node
// Module attribution des Pins GPIO

var Gpio = require('onoff').Gpio;
led = new Gpio(15, 'out');
nose = new Gpio(15, 'out');
eye = new Gpio(14, 'out');
belly = new Gpio(17, 'out');
satellite = new Gpio(23, 'out');

etat = new Gpio(13, 'in', 'both', {persistentWatch:true,debounceTimeout:500});
ok = new Gpio(20, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
cancel = new Gpio(16, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
white = new Gpio(19, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
blue = new Gpio(26, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
