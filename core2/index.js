#!/usr/bin/env node
'use strict'

console.log('Starting...');

/** Odi's paths */
global.ODI_PATH = '/home/pi/odi/core2/';
global.CORE_PATH = ODI_PATH + 'core/';
global.CONFIG_FILE = ODI_PATH + 'conf.json';
global.DATA_PATH = ODI_PATH + 'data/';
global.LOG_PATH = ODI_PATH + 'log/';
global.WEB_PATH = ODI_PATH + 'web/';
global.TMP_PATH = ODI_PATH + 'tmp/';
// global.CONFIG = require(CONFIG_FILE); TO REACTIVATE LATER...

global.FLUX = {};

// global.FLUX.button = require(CORE_PATH + 'buttonController.js').init;
global.FLUX.button = require(CORE_PATH + 'controllers/button.js').init;
//global.FLUX.out;

const brain = require(CORE_PATH + 'brain.js');
const serviceA = require(CORE_PATH + 'modules/serviceA.js');