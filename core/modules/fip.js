#!/usr/bin/env node

// Module Fip

var spawn = require('child_process').spawn;
/*var leds = require(CORE_PATH + 'modules/leds.js');
var hardware = require('./hardware.js');
//var self = this;*/

var playing = false;

var fipInterval;

module.exports = {
	playing: isPlaying,
	play: play,
	stop: stop
};

function isPlaying(){
	return playing;
}

/** Function to play FIP radio */
function play(){
	console.log('playFip()> playing', playing);
	if(!playing){
		console.log('Play FIP RADIO...');
		spawn('sh', ['/home/pi/odi/core/sh/fip.sh']);
		playing = true;
		ODI.leds.altLeds(100, 1.3);

		fipInterval = setInterval(function(){
			if(playing){
				//console.log('Playing FIP RADIO...!');
				ODI.leds.altLeds(100, 1.3);
			}
		}, 13*1000);
	console.log('playFip > playing:', playing);

		cancel.watch(function(err, value){ // TODO : remove ???
			clearInterval(fipInterval);
			playing = false;
		});
	}
	else{
		console.log('Already playing FIP');
		// PLAY FIP WITH !VOLUME (invert volume)
	}

	setTimeout(function(){
		stop();
	}, 60*60*1000);
	ODI.hardware.mute(60, 'Auto Mute FIP');
};

/** Function to stop FIP radio */
function stop(message){
	console.log('playFip> playing:', playing);
	console.debug(message || 'Stoping FIP RADIO.');
	spawn('sh', ['/home/pi/odi/core/sh/mute.sh']);
	playing = false;
	clearInterval(fipInterval);
	eye.write(0);
	belly.write(0);
	ODI.leds.clearLeds();
};
