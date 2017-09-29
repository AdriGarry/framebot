#!/usr/bin/env node
'use strict'

console.log('Starting...');
//console.log('Odi\'s context initializing...');

global.ODI_PATH = '/home/pi/odi/core3/';

var ODI = require(ODI_PATH + 'core/shared.js');
// var ODI = require(ODI_PATH + 'core/shared.js').initialize('/home/pi/odi/core3/'); ???

console.log(ODI.config);

// Controllers
var button = require(ODI.path.CORE_PATH + 'controllers/button.js');

// Brain
var brain = require(ODI.path.CORE_PATH + 'brain.js');

// Services
var soundService = require(ODI.path.CORE_PATH + 'services/soundService.js');
var timeService = require(ODI.path.CORE_PATH + 'services/timeService.js');

// Modules
// led.js, sound.js

/////////////  TEST  /////////////

var Rx = require('rxjs');
// var observable = Rx.Observable.from([10, 20, 30]);
// var subscription = observable.subscribe(x => console.log(x));
// // Later:
// subscription.unsubscribe();

var source = Rx.Observable.from([1, 2, 3]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

// These are, under the hood, `subject.subscribe({...})`:
multicasted.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
multicasted.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

// This is, under the hood, `source.subscribe(subject)`:
multicasted.connect();