#!/usr/bin/env node

// Module Jukebox

var spawn = require('child_process').spawn;
var utils = require('./utils.js');

/** Fonction jukebox (repeat) */
var loop = function(message){
	utils.mute('Next jukebox song !');
	setTimeout(function(){
		console.log('Jukebox in loop mode !');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
		utils.autoMute();
	}, 200);
};
exports.loop = loop;

/** Fonction medley jukebox (repeat) */
var medley = function(message){
	utils.mute('Next jukebox [medley] song !');
	setTimeout(function(){
		console.log('Jukebox in medley mode !');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
		utils.autoMute();
	}, 200);
};
exports.medley = medley;