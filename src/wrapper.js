#!/usr/bin/env node
'use strict';

/** Params detection */
var argv = process.argv.splice(2);

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const Gpio = require('onoff').Gpio;

const sep = path.sep;
// const SRC_PATH = __filename.match(/\/.*\//g)[0];
const SRC_PATH = __dirname + sep;
const ODI_PATH = __dirname.replace('src', '');
const INTERVALS = [2, 5, 10, 30, 60, 90, 180];
const wrapperTitle = '\n┌──────────────┐\n│  > Wrapper   │\n└──────────────┘';

// console.log('Wrapper started');
var descriptor;

wrapper();

var i = 0,
	interval,
	timeout,
	okButton;
function wrapper(code) {
	console.log(wrapperTitle);
	if (!code) {
		startOdi();
		return;
	}
	let timeoutDelay = INTERVALS[i];
	i++;
	console.log('Error in Odi program!');
	process.stdout.write('Push Ok button or wait for ' + timeoutDelay + ' sec');
	if (i == INTERVALS.length) {
		i = 0;
	}
	interval = setInterval(() => {
		process.stdout.write('.');
	}, 1000);
	timeout = setTimeout(() => {
		console.log('\nrestarting Odi');
		restartOdiFromWrapper(code);
	}, timeoutDelay * 1000);

	okButton = new Gpio(20, 'in', 'rising', { persistentWatch: true, debounceTimeout: 500 });
	okButton.watch(function(err, value) {
		console.log('\nOk Button pushed, restarting Odi');
		restartOdiFromWrapper(code);
	});
}

function restartOdiFromWrapper(code) {
	clearInterval(interval);
	clearTimeout(timeout);
	okButton.unwatch();
	startOdi(code);
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
	var odiCore = spawn('node', odiProgramWithParams);

	odiCore.stdout.on('data', function(data) {
		process.stdout.write(data);
	});

	odiCore.stderr.on('data', function(data) {
		process.stdout.write(data);
	});

	odiCore.on('exit', function(code) {
		spawn('sh', [SRC_PATH + 'shell/mute.sh']);
		//if (code && odiConf.mode != 'sleep') spawn('sh', [SRC_PATH + 'shell/sounds.sh', 'error']);
		console.log("\n>> Odi's CORE restarting... [code:" + code + ']');
		argv.remove('test'); // Removing test param before relaunching
		argv.remove('reset'); // Removing reset param before relaunching
		wrapper(code);
	});
}

function checkUp() {
	console.log('checkUp...');
	descriptor = JSON.parse(fs.readFileSync(ODI_PATH + 'data/descriptor.json'));
	if (!fs.existsSync(ODI_PATH + 'tmp')) {
		fs.mkdirSync(path.join(ODI_PATH, 'tmp'), 777);
		fs.chmodSync(path.join(ODI_PATH, 'tmp'), 777);
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
