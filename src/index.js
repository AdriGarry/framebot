#!/usr/bin/env node

/** Params detection */
const argv = process.argv.splice(2);

var fs = require('fs');
var spawn = require('child_process').spawn;

/** Odi's global variables */
global.ODI_PATH = __filename.match(/\/.*\//g)[0];

/** Function to start up Odi */
(function startOdi(exitCode) {
	spawn('sh', [ODI_PATH + 'src/shell/mute.sh']); // Mute

	var Gpio = require('onoff').Gpio;
	var eye = new Gpio(14, 'out').write(1);
	
	// console.log('.', forcedDebug || '', test || '');
	console.log(argv);
	// odiCore = spawn('node', [ODI_PATH + 'initializer.js', forcedDebug, test]);

	if(exitCode){
		// démarrer en sleep ! TODO :!
	}
	var odiProgramWithParams = [ODI_PATH + 'main.js'];
	for (var i = 0; i < argv.length; i++) {
		odiProgramWithParams.push(argv[i]);
	}
	odiCore = spawn('node', odiProgramWithParams);

	odiCore.stdout.on('data', function(data) {
		process.stdout.write(data);
	});

	odiCore.stderr.on('data', function(data) {
		process.stdout.write(data);
	});

	odiCore.on('exit', function(code) {
		spawn('sh', [ODI_PATH + 'shell/mute.sh']);  // Mute // + LEDS ???
		console.log(">> Odi's CORE restarting... [code:" + code + ']');
		argv.remove('test'); // Removing test param before relaunching
		startOdi(code);
	});
})();

Array.prototype.remove = function() {
	var what,
		a = arguments,
		L = a.length,
		ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};
