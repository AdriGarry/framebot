#!/usr/bin/env node

// Module Video

var spawn = require('child_process').spawn;
var tts = require(CORE_PATH + 'modules/tts.js');

module.exports = {
	screenOn: screenOn,
	screenOff: screenOff,
	startCycle: startCycle
};

/** Function to turn screen on */
function screenOn(){
	spawn('sh', ['/home/pi/odi/core/sh/screen.sh', 'on']);
	console.log('screenOn()');
	setTimeout(function(){
		screenOff();
	// }, 10*1000);
	}, 30*60*1000);
};

/** Function to turn screen off */
function screenOff(){
	spawn('sh', ['/home/pi/odi/core/sh/screen.sh', 'off']);
	console.log('screenOff()');
};

/** Function to launch a video cycle for 30 minutes */
function startCycle(){
	spawn('sh', ['/home/pi/odi/core/sh/diapo.sh']);
	console.log('videoCycle() for one hour');
	setTimeout(function(){
		sleep();
	// }, 45*1000);
	}, 30*60*1000);
};

/** Function to sleep monitor */
/*function off(mode){
	console.log('video.off(mode)', mode);
	spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'sleep']);
};*/

