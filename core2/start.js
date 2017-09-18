#!/usr/bin/env node
'use strict'

console.log('Starting...');

global.FLUX = {};

global.FLUX.button = require('/home/pi/odi/core2/buttonController.js').init;
//global.FLUX.out;

const brain = require('/home/pi/odi/core2/brain.js');
const serviceA = require('/home/pi/odi/core2/serviceA.js');


// var Rx = require('rxjs');
// var observable = Rx.Observable.create(function (observer) {
//   observer.next(1);
//   observer.next(2);
//   observer.next(3);
//   setTimeout(() => {
//     observer.next(4);
//     observer.complete();
//   }, 1000);
// });

// console.log('just before subscribe');
// observable.subscribe({
//   next: x => console.log('got value ' + x),
//   error: err => console.error('something wrong occurred: ' + err),
//   complete: () => console.log('done'),
// });
// console.log('just after subscribe');