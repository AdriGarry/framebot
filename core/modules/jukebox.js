#!/usr/bin/env node

// Module Jukebox

var spawn = require('child_process').spawn;
// var hardware = require('./hardware.js');
var utils = require('./utils.js');

/** Fonction jukebox (repeat) */
var loop = function(message){
	utils.mute(0, 'Next jukebox song !');
	setTimeout(function(){
		console.log('Jukebox in loop mode !');
		var deploy = spawn('sh', ['/home/pi/odi/core/sh/jukebox.sh']);
		utils.mute(60, 'Auto mute jukebox !');
	}, 200);
};
exports.loop = loop;

/** Fonction medley jukebox (repeat) */
var medley = function(message){
	utils.mute(0, 'Next jukebox [medley] song !');
	setTimeout(function(){
		console.log('Jukebox in medley mode !');
		var deploy = spawn('sh', ['/home/pi/odi/core/sh/jukebox.sh', 'medley']);
		utils.mute(60, 'Auto mute jukebox !');
	}, 200);
};
exports.medley = medley;