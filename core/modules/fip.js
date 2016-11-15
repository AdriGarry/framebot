#!/usr/bin/env node

// Module Fip

var spawn = require('child_process').spawn;
var leds = require(CORE_PATH + 'modules/leds.js');
var utils = require(CORE_PATH + 'modules/utils.js');
var self = this;

var playing = false;

var fipInterval;

module.exports = {
	playing: isPlaying,
	playFip: playFip,
	stopFip: stopFip
}

/** Function to return playing status */
function isPlaying(){
	return playing;
}

/** Function to play FIP radio */
function playFip(){
	if(!playing){
		console.log('Play FIP RADIO...');
		spawn('sh', ['/home/pi/odi/core/sh/fip.sh']);
		playing = true;
		leds.altLeds(100, 1.3);
		
		cancel.watch(function(err, value){ // TODO : remove ???
			clearInterval(fipInterval);
			playing;
		});

		fipInterval = setInterval(function(){
			if(playing){
				//console.log('Playing FIP RADIO...!');
				leds.altLeds(100, 1.3);
			}
		}, 13*1000);
	}
	else{
		console.log('I\'m already playing FIP !');
		// PLAY FIP WITH !VOLUME (invert volume)
	}

	// TODO SET TIMEOUT ... stopFip();
	setTimeout(function(){
		stopFip();
	}, 60*60*1000);

	utils.mute(60, 'Auto Mute FIP');
}

/** Function to stop FIP radio */
function stopFip(message){
	console.debug(message || 'Stoping FIP RADIO.');
	spawn('sh', ['/home/pi/odi/core/sh/mute.sh']);
	playing = false;
	clearInterval(fipInterval);
	eye.write(0);
	belly.write(0);
	leds.clearLeds();
}

console.log('fip this', this);
