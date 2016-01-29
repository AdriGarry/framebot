#!/usr/bin/env node
// Module Fip

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var led = require('./led.js');
var utils = require('./utils.js');

var self = this;

var instance = false;
exports.instance = instance;

self.fipInterval;

var playFip = function(){
	if(!self.instance){
		console.log('Play FIP RADIO...');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/fip.sh']);
		self.instance = true;
		led.altLeds(100, 1.3);
		
		cancel.watch(function(err, value){
			clearInterval(self.fipInterval);
			self.instance = false;
		});
		self.fipInterval = setInterval(function(){
			if(self.instance){
				console.log('Playing FIP RADIO...!');
				led.altLeds(100, 1.3);
			}
		}, 13*1000);
	}
	else{
		console.log('I\'m already playing FIP !');
	}
	utils.autoMute();
};
exports.playFip = playFip;

var stopFip = function(message){
	console.log(message || 'Stoping FIP RADIO.');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	self.instance = false;
	clearInterval(self.fipInterval);
	eye.write(0);
	belly.write(0);
	led.clearLeds();
};
exports.stopFip = stopFip;
