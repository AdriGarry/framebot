#!/usr/bin/env node

// Module Jukebox

var spawn = require('child_process').spawn;
var hardware = require('./hardware.js');
var utils = require(CORE_PATH + 'modules/utils.js');

module.exports = {
	loop: loop,
	medley: medley
};

/** Function jukebox (repeat) */
function loop(message){
	hardware.mute(0, 'Next jukebox song !');
	setTimeout(function(){
		console.log('Jukebox in loop mode !');
		spawn('sh', ['/home/pi/odi/core/sh/jukebox.sh']);
		hardware.mute(60, 'Auto mute jukebox !');
	}, 200);
};

/** Function medley jukebox (repeat) */
function medley(message){
	hardware.mute(0, 'Next jukebox [medley] song !');
	setTimeout(function(){
		console.log('Jukebox in medley mode !');
		spawn('sh', ['/home/pi/odi/core/sh/jukebox.sh', 'medley']);
		hardware.mute(60, 'Auto mute jukebox !');
	}, 200);
};
