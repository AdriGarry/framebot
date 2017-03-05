#!/usr/bin/env node

// Module Video

var spawn = require('child_process').spawn;
var tts = require(CORE_PATH + 'modules/tts.js');

module.exports = {
	start: start,
	off: off
};

/** Function to launch a video cycle for 30 minutes */
function start(){
	spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'random']);
	console.log('videoCycle() for one hour');
	setTimeout(function(){
		sleep();
	// }, 45*1000);
	}, 30*60*1000);
};

/** Function to sleep monitor */
function off(mode){
	console.log('video.off(mode)', mode);
	/*if(isNaN(mode)){
		tts.speak({voice: 'espeak', lg:'fr', msg: 'Fin du cycle video'});
	}*/
	spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'sleep']);
};

