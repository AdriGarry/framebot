#!/usr/bin/env node

/** Params detection */
var argv = process.argv.splice(2);

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;

var sep = path.sep;
// const SRC_PATH = __filename.match(/\/.*\//g)[0];
const SRC_PATH = __dirname + sep;
const ODI_PATH = __dirname.replace('src', '');
const INTERVALS = [2, 5, 10, 30, 60, 90, 180];
const launcherTitle = '\n┌───────────────┐\n│  > Launcher   │\n└───────────────┘';

console.log(launcherTitle);
var descriptor;

function checkUp() {
	console.log('checkUp...');
	descriptor = JSON.parse(fs.readFileSync(ODI_PATH + 'data/descriptor.json'));
	if (!fs.existsSync(ODI_PATH + 'tmp')) {
		fs.mkdirSync(path.join(ODI_PATH, 'tmp'), 0777);
		fs.chmodSync(path.join(ODI_PATH, 'tmp'), 0777);
		console.log('> TEMP directory created');
	} else {
		checkVoicemailValidity();
	}
	if (!fs.existsSync(ODI_PATH + 'log')) {
		fs.mkdirSync(ODI_PATH + 'log');
		console.log('> LOG directory created');
	}

	console.log(argv);

	if (argv.indexOf('reset') > -1) {
		reInitConf();
	} else {
		checkConfValidity();
	}
}

startOdi();

function checkConfValidity() {
	try {
		let conf = fs.readFileSync(ODI_PATH + 'tmp/conf.json', 'utf-8');
		JSON.parse(conf);
	} catch (err) {
		console.log(err.message);
		reInitConf();
	}
}
function reInitConf() {
	fs.writeFileSync(ODI_PATH + 'tmp/conf.json', JSON.stringify(descriptor.conf), 'utf-8');
	console.log('> CONF reset');
}

function checkVoicemailValidity() {
	if (fs.existsSync(ODI_PATH + 'tmp/voicemail.json')) {
		try {
			let conf = fs.readFileSync(ODI_PATH + 'tmp/voicemail.json', 'utf-8');
			JSON.parse(conf);
		} catch (err) {
			console.log(err.message);
			fs.unlinkSync(ODI_PATH + 'tmp/voicemail.json');
			console.log('> Invalid voicemail message, deleted!');
		}
	}
}

var i = 0;
function wrapper(code) {
	console.log(launcherTitle);
	if (!code) {
		startOdi();
		return;
	}
	timeout = INTERVALS[i];
	i++;
	process.stdout.write('Error, wainting for ' + timeout + ' sec');
	if (i == INTERVALS.length) {
		i = 0;
	}
	let interval = setInterval(() => {
		process.stdout.write('.');
	}, 1000);
	setTimeout(() => {
		clearInterval(interval);
		process.stdout.write('\nand restart Odi\n');
		startOdi(code);
	}, timeout * 1000);
}

/** Function to start up Odi */
function startOdi(exitCode) {
	spawn('sh', [SRC_PATH + 'shell/mute.sh']);

	checkUp();

	const odiConf = fs.readFileSync(ODI_PATH + 'tmp/conf.json');

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
		spawn('sh', [SRC_PATH + 'shell/mute.sh']);
		if (code && odiConf.mode != 'sleep') spawn('sh', [SRC_PATH + 'shell/sounds.sh', 'error']);
		console.log("\n>> Odi's CORE restarting... [code:" + code + ']');
		argv.remove('test'); // Removing test param before relaunching
		argv.remove('reset'); // Removing reset param before relaunching
		wrapper(code);
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
