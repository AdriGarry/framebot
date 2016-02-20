#!/usr/bin/env node
// Module Jukebox

var spawn = require('child_process').spawn;
var utils = require('./utils.js');

var loop = function(message){
	utils.mute('Next jukebox song !');
	console.log('Jukebox in loop mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
	utils.autoMute();
};
exports.loop = loop;

var medley = function(message){
	utils.mute('Next jukebox [medley] song !');
	console.log('Jukebox in medley mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
	utils.autoMute();
};
exports.medley = medley;