#!/usr/bin/env node

// Module Fip

var spawn = require('child_process').spawn;
var leds = require('./leds.js');
// var hardware = require('./hardware.js');
// var utils = require('./utils.js');

var self = this;

var instance = false;
//exports.instance = instance;

self.fipInterval;

module.exports = {
	instance: instance,	
	playFip: playFip,
	stopFip: stopFip
}

/** Function to play FIP radio */
function playFip(){
	if(!self.instance){
		console.log('Play FIP RADIO...');
		spawn('sh', ['/home/pi/odi/core/sh/fip.sh']);
		self.instance = true;
		leds.altLeds(100, 1.3);
		
		cancel.watch(function(err, value){
			clearInterval(self.fipInterval);
			self.instance = false;
		});
		self.fipInterval = setInterval(function(){
			if(self.instance){
				//console.log('Playing FIP RADIO...!');
				leds.altLeds(100, 1.3);
			}
		}, 13*1000);
	}
	else{
		console.log('I\'m already playing FIP !');
	}
	//utils.mute(60, 'Auto Mute FIP');

	// TODO SET TIMEOUT ... stopFip();
};

/** Function to stop FIP radio */
function stopFip(message){
	console.debug(message || 'Stoping FIP RADIO.');
	spawn('sh', ['/home/pi/odi/core/sh/mute.sh']);
	self.instance = false;
	clearInterval(self.fipInterval);
	eye.write(0);
	belly.write(0);
	leds.clearLeds();
};
