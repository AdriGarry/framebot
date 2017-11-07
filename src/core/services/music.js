#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;

Flux.service.music.subscribe({
	next: flux => {
		if(flux.id == 'jukebox'){
			if(flux.value == 'stop'){
				// To implement ?
			}else jukebox();
		}else if(flux.id == 'fip'){
			if(flux.value == 'stop'){
				stopFip();
			}else playFip();
		}else if(flux.id == 'stop'){
			// To implement ?
		}else Odi.error('unmapped flux in Time service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

/*module.exports = {
	loop: loop,
	medley: medley,
	isPlayingFip: isPlayingFip,
	playFip: playFip,
	stopFip: stopFip
};*/

/** Function jukebox (repeat) */
function jukebox(message){
	Flux.next('module', 'sound', 'mute');
	setTimeout(function(){
		log.info('Jukebox in loop mode !');
		spawn('sh', [Odi._SHELL + 'shell/jukebox.sh']);
		log.info('jukebox.loop() ERROR to debug...');
		Flux.next('module', 'sound', 'mute', {message: 'Auto mute jukebox !'}, 60*60)
	}, 1000);
};

/** Function medley jukebox (repeat) */
function medley(message){
	Flux.next('module', 'sound', 'mute');
	setTimeout(function(){
		log.info('Jukebox in medley mode !');
		spawn('sh', [Odi._SHELL + 'shell/jukebox.sh', 'medley']);
		Flux.next('module', 'sound', 'mute', {message: 'Auto mute jukebox !'}, 60*60)
	}, 300);
};

var playingFip = false, fipInterval;
/** Function to play FIP radio */
function playFip(){
	if(!playingFip){
		log.info('Play FIP RADIO...');
		spawn('sh', ['/home/pi/odi/core/sh/fip.sh']);
		playingFip = true;
		Flux.next('module', 'led', 'altLeds', {speed: 100, duration: 1.3});

		fipInterval = setInterval(function(){
			if(playingFip){
				Flux.next('module', 'led', 'altLeds', {speed: 100, duration: 1.3});
			}
		}, 13*1000);
		log.info('playFip()> playingFip', playingFip);

		//cancel.watch(function(err, value){ // TODO : remove ???
			//clearInterval(fipInterval);
		// 	playingFip = false;
		// });
	}else{
		log.info('Already playing FIP');
	}

	setTimeout(function(){
		stopFip();
	}, 60*60*1000);
	Flux.next('module', 'sound', 'mute', {message: 'Auto Mute FIP'}, 60*60)
};

/** Function to stop FIP radio */
function stopFip(message){
	if(playingFip){
		log.info('playFip()> playingFip', playingFip);
		log.debug(message || 'Stoping FIP RADIO.');
	}
	// spawn('sh', ['/home/pi/odi/core/sh/mute.sh']); // Inutile ?
	Flux.next('module', 'sound', 'mute'); // Inutile ?
	playingFip = false;
	clearInterval(fipInterval);
	// ODI.leds.eye.write(0);
	// ODI.leds.belly.write(0);
	// ODI.leds.clearLeds();
	Flux.next('module', 'led', 'toggle', {leds: [''], value: 0});
	Flux.next('module', 'led', 'clearLeds', {speed: 100, duration: 1.3});
	Flux.next('module', 'sound', 'mute');
};
