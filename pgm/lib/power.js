// #!/usr/bin/env node

// var power = function(){

// var spawn = require('child_process').spawn;
// var fs = require('fs');
// var utils = require('./utils.js');
// var tts = require('./tts.js');

// var self = this;
// var deploy;

// self.reboot = function(){
	// utils.whatsup();
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'reboot']);
	// console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	// setTimeout(function(){
		// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh', 'reboot']);
	// }, 2000);
// };

// self.shutdown = function(){
	// utils.whatsup();
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'shutdown']);
	// console.log('_/!\\__SHUTING DOWN RASPBERRY PI !!');
	// setTimeout(function(){
		// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/reInit_log.sh']);
		// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh']);
	// }, 2000);
// };

// self.restartOdi = function(){
	// console.log('Restarting Odi !!');
	// setTimeout(function(){
		// process.exit();
	// }, 1000);
// };
// }
// module.exports = power;