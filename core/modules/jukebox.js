#!/usr/bin/env node

// Module Jukebox

var spawn = require('child_process').spawn;

module.exports = {
	loop: loop,
	medley: medley,
	isPlayingFip: isPlayingFip,
	playFip: playFip,
	stopFip: stopFip
};

/** Function jukebox (repeat) */
function loop(message){
	ODI.hardware.mute(0, 'Next jukebox song !');
	setTimeout(function(){
		console.log('Jukebox in loop mode !');
		spawn('sh', [CORE_PATH + 'sh/jukebox.sh']);
		console.log('jukebox.loop() ERROR to debug...');
		ODI.hardware.mute(60, 'Auto mute jukebox !');
	}, 300);
};

/** Function medley jukebox (repeat) */
function medley(message){
	ODI.hardware.mute(0, 'Next jukebox [medley] song !');
	setTimeout(function(){
		console.log('Jukebox in medley mode !');
		spawn('sh', [CORE_PATH + 'sh/jukebox.sh', 'medley']);
		ODI.hardware.mute(60, 'Auto mute jukebox !');
	}, 300);
};

var playingFip = false, fipInterval;

function isPlayingFip(){ // TODO essayer d'enlever ce getter et récupérer directement le boolean
	return playingFip;
}

/** Function to play FIP radio */
function playFip(){
	console.log('playFip()> playingFip', playingFip);
	if(!playingFip){
		console.log('Play FIP RADIO...');
		spawn('sh', ['/home/pi/odi/core/sh/fip.sh']);
		playingFip = true;
		ODI.leds.altLeds(100, 1.3);

		fipInterval = setInterval(function(){
			if(playingFip){
				ODI.leds.altLeds(100, 1.3);
			}
		}, 13*1000);
		console.log('playFip()> playingFip', playingFip);

		cancel.watch(function(err, value){ // TODO : remove ???
			clearInterval(fipInterval);
			playingFip = false;
		});
	}else{
		console.log('Already playing FIP');
		// PLAY FIP WITH !VOLUME (invert volume)
	}

	setTimeout(function(){
		stopFip();
	}, 60*60*1000);
	ODI.hardware.mute(60, 'Auto Mute FIP');
};

/** Function to stop FIP radio */
function stopFip(message){
	if(playingFip){
		console.log('playFip()> playingFip', playingFip);
		console.debug(message || 'Stoping FIP RADIO.');
	}
	spawn('sh', ['/home/pi/odi/core/sh/mute.sh']); // Inutile ?
	playingFip = false;
	clearInterval(fipInterval);
	ODI.leds.eye.write(0);
	ODI.leds.belly.write(0);
	ODI.leds.clearLeds();
};
