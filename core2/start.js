#!/usr/bin/env node
'use strict'

global.FLUX = {};

global.FLUX.button = require('/home/pi/odi/core2/buttonController.js').init;
global.FLUX.out;

const brain = require('/home/pi/odi/core2/brain.js');
const serviceA = require('/home/pi/odi/core2/serviceA.js');