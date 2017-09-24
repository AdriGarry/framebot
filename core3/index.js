#!/usr/bin/env node
'use strict'

console.log('Starting...');
global.ODI_PATH = '/home/pi/odi/core3/';

var ODI = require(ODI_PATH + 'core/shared.js');

// Controllers
var button = require(ODI.path.CORE_PATH + 'controllers/button.js');

// Brain
var brain = require(ODI.path.CORE_PATH + 'brain.js');

// Services
var soundService = require(ODI.path.CORE_PATH + 'services/soundService.js');
var timeService = require(ODI.path.CORE_PATH + 'services/timeService.js');


/////////////  TEST  /////////////
var Rx = require('rxjs');
var observable = Rx.Observable.from([10, 20, 30]);
var subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
