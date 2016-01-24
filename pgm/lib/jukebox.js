#!/usr/bin/env node
// Module Jukebox

var jukebox = function(){

var spawn = require('child_process').spawn;
var utils = require('./utils.js');

var self = this;

self.loop = function(message){
	utils.mute();
	console.log('Let\'s play the Jukebox in loop mode !');
	utils.sleepNode(0.5,0);
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
};

self.medley = function(message){
	console.log('Let\'s play the Jukebox in medley mode !');
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
};
}
module.exports = jukebox;