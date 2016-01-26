#!/usr/bin/env node
// Module Jukebox

var spawn = require('child_process').spawn;
var utils = require('./utils.js');

var self = this;

var loop = function(message){
	console.log('Let\'s play the Jukebox in loop mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
	utils.autoMute();
};
exports.loop = loop;

var medley = function(message){
	console.log('Let\'s play the Jukebox in medley mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
};
exports.medley = medley;