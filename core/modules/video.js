#!/usr/bin/env node

// Module Video

var spawn = require('child_process').spawn;

module.exports = {
	screenOn: screenOn,
	screenOff: screenOff,
	startCycle: startCycle
};

/** Function to turn screen on (for 30 minutes) */
function screenOn(){
	spawn('sh', ['/home/pi/odi/core/sh/screen.sh', 'on']);
	console.log('screen On');
	setTimeout(function(){
		screenOff();
	}, 30*60*1000);
};

/** Function to turn screen off */
function screenOff(){
	spawn('sh', ['/home/pi/odi/core/sh/screen.sh', 'off']);
	console.log('screen Off');
};

/** Function to launch a video cycle for 30 minutes */
function startCycle(){
	spawn('sh', ['/home/pi/odi/core/sh/diapo.sh']);
	console.log('videoCycle() for one hour');
	setTimeout(function(){
		screenOff();
	// }, 30*1000);
	}, 30*60*1000);
};

/** Function to sleep monitor */
/*function off(mode){
	console.log('video.off(mode)', mode);
	spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'sleep']);
};*/

