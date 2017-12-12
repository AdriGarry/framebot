#!/usr/bin/env node

/** Params detection */
const argv = process.argv.splice(2);

var fs = require('fs');
var spawn = require('child_process').spawn;

//const SRC_PATH = __filename.match(/\/.*\//g)[0];
const SRC_PATH = __dirname + '\\';
const ODI_PATH = SRC_PATH.replace('src\\', '');

/** Function to start up Odi */
(function startOdi(exitCode) {
	spawn('sh', [SRC_PATH + 'shell/mute.sh']); // Mute

	const odiConf = require(ODI_PATH + 'conf.json');

	var Gpio = require('onoff').Gpio;
	var eye = new Gpio(14, 'out').write(1);

	console.log(argv);

	var odiProgramWithParams = [SRC_PATH + 'main.js'];
	if (exitCode) {
		odiProgramWithParams.push('sleep');
	}
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
		spawn('sh', [SRC_PATH + 'shell/mute.sh']); // Mute // + LEDS ???
		if (code && odiConf.mode != 'sleep') spawn('sh', [SRC_PATH + 'shell/sounds.sh', 'error']);
		console.log("\n>> Odi's CORE restarting... [code:" + code + ']');
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
