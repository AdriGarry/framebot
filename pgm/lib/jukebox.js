#!/usr/bin/env node
// Module Jukebox

var jukebox = function(){

var spawn = require('child_process').spawn;
var _utils = require('./utils.js');
var utils = new _utils();

var self = this;

self.loop = function(message){
	utils.mute();
	console.log('Let\'s play the Jukebox in loop mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
};

self.medley = function(message){
	console.log('Let\'s play the Jukebox in medley mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
};
}
module.exports = jukebox;