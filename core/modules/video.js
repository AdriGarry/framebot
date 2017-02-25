#!/usr/bin/env node

// Module Service

var spawn = require('child_process').spawn;
var tts = require(CORE_PATH + 'modules/tts.js');

module.exports = {
	start: start,
	sleep: sleep
};

/** Function to launch a video cycle for 1 hour */
function start(){
	spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'random']);
	console.log('videoCycle() for one hour');
	setTimeout(function(){
		sleep();
	}, 40*1000);
	// }, 60*60*1000);
};

/** Function to sleep monitor */
function sleep(mode){
	// console.log('CONFIG', CONFIG);
	// console.log('===>mode', mode);
	// console.log('video.sleep()');
	console.log('video.sleep(mode)', mode);
	if(isNaN(mode)){
		// console.log('DANS LE TEST');
		tts.speak({voice: 'espeak', lg:'en', msg: 'stopping video output'});
	}
	// if(CONFIG.mode !== 'sleep') tts.speak({voice: 'espeak', lg:'en', msg: 'stopping video output'});
	spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'sleep']);
	// tts.speak({voice: 'espeak', lg:'fr', msg: 'Fin du cycle video'});
	// spawn('sh', ['/home/pi/odi/core/sh/video.sh', 'sleep']);
};

