#!/usr/bin/env node
// Module Events

var event = function(){

// var log = 'Odi/ ';
// var spawn = require('child_process').spawn;
// var exec = require('child_process').exec;
// var leds = require('./leds.js');
// var ledsInstance = new leds();
// var exclamation = require('./exclamation.js');
// var exclamationInstance = new exclamation();
// var timer = require('./timer.js');
// var timerInstance = new timer();
// var fip = require('./fip.js');
// var fipInstance = new fip();
// var tts = require('./tts.js');
// var ttsInstance = new tts();
// var power = require('./power.js');
// var powerInstance = new power();
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();

// var self = this;
// var content;

console.log('Event Lib Imported');

// self.initEvents = function(){
		// console.log('Function initEvents()');
		event.on('timer', function(message){
			console.log(message);
		});
// };

}
module.exports = event;