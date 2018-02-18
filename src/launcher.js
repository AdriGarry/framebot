#!/usr/bin/env node

/** Params detection */
const argv = process.argv.splice(2);

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

let sep = path.sep;
// const SRC_PATH = __filename.match(/\/.*\//g)[0];
const SRC_PATH = __dirname + sep;
const ODI_PATH = __dirname.replace('src', '');

console.log('\n┌─────────────────┐\n│  > Launcher...  │\n└─────────────────┘');
if (!fs.existsSync(ODI_PATH + 'tmp')) {
	fs.mkdirSync(ODI_PATH + 'tmp');
	console.log('> TEMP directory created');
}
if (!fs.existsSync(ODI_PATH + 'log')) {
	fs.mkdirSync(ODI_PATH + 'log');
	console.log('> LOG directory created');
}

console.log(argv);

if (argv.indexOf('reset') > -1) {
	reInit();
} else {
	try {
		let conf = fs.readFileSync(ODI_PATH + 'conf.json', 'utf-8');
		JSON.parse(conf);
	} catch (err) {
		console.log(err.message);
		reInit();
	}
}

startOdi();

function reInit() {
	let defaultConf = fs.readFileSync(ODI_PATH + 'data/defaultConf.json', 'utf-8');
	fs.writeFileSync(ODI_PATH + 'conf.json', defaultConf, 'utf-8');
	console.log('> CONF reset');
}

/** Function to start up Odi */
function startOdi(exitCode) {
	spawn('sh', [SRC_PATH + 'shell/mute.sh']); // Mute

	const odiConf = require(ODI_PATH + 'conf.json');

	var Gpio = require('onoff').Gpio;
	var eye = new Gpio(14, 'out').write(1);

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
}

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
