#!/usr/bin/env node
// Module Power

var power = function(){

var spawn = require('child_process').spawn;
var fs = require('fs');
var utils = require('./utils.js');
var tts = require('./tts.js');

var self = this;
var deploy;

self.reboot = function(){
	// tts.speak('fr','A tout de suite !');
	utils.whatsup();
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'reboot']);
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	// deploy = spawn('omxplayer', ['/home/pi/odi/mp3/sounds/autres/beback.mp3', '-o local']);
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh', 'reboot']);
	}, 2000);
};

self.shutdown = function(){
	// tts.speak('fr','Arret du systeme !');
	utils.whatsup();
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'shutdown']);
	// deploy = spawn('omxplayer', ['-o local', '/home/pi/odi/mp3/sounds/autres/sessionOff.mp3']);
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI !!');
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/reInit_log.sh']);
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh']);
	}, 2000);
};

self.restartOdi = function(){
	//tts.speak('en','Restarting Ody ! !');
	console.log('Restarting Odi !!');
	setTimeout(function(){
		process.exit();
	}, 1000);
};
}
module.exports = power;