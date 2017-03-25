#!/usr/bin/env node

/** Odi's global variables  */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';

var fs = require('fs');
var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var gpioPins = require(CORE_PATH + 'modules/gpioPins.js');
var utils = require(CORE_PATH + 'modules/utils.js');
// console.log('MASTER logTime', utils.logTime('D/M h:m:s'));
var odiPgm, odiState = false;
const logoNormal = fs.readFileSync(DATA_PATH + 'odiLogo.properties', 'utf8').toString().split('\n');
const logoSleep = fs.readFileSync(DATA_PATH + 'odiLogoSleep.properties', 'utf8').toString().split('\n');

/* ------------- START CORE -------------*/
// console.log('\r\n---------------------\r\n>> Odi\'s CORE started');
console.log('\r\n>> Odi\'s CORE started');

startOdi(); // First init

ok.watch(function(err, value){
	if(!odiState){ // Watch green button to force start... DEPRECATED ???
		startOdi();
	}
});

var logDate, logMode = getLogMode(), timeToWakeUp;
var date, month, day, hour, min, sec;

/** Function to start up Odi */
function startOdi(mode){
	/** Setting up Odi's config */
	global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

	spawn('sh', [CORE_PATH + 'sh/mute.sh']); // Mute // + LEDS ???
	
	var logo;
	if(typeof mode === 'undefined') mode = '';
	// if(typeof mode === Number){
	if(/\d/.test(mode) && mode == 255){
		logMode = ' O';
		logo = logoSleep;
		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js', mode]);
	}else if(/\d/.test(mode) && mode > 0 && mode < 255){
		timeToWakeUp = mode * 60; // Convert to minutes
		logMode = ' O' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
		logo = logoSleep;
		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js', mode]);
		decrementTime();
	}else{
		timeToWakeUp = 0;
		logMode = ' Odi';
		logo = logoNormal;
		odiPgm = spawn('node', [CORE_PATH + 'odi.js', mode]);
	}

	console.log('\n\n' + logo.join('\n'));

	etat.watch(function(err, value){
		logMode = getLogMode();
	});

	odiState = true;
	odiPgm.stdout.on('data', function(data){ // Template log output
		console.log(utils.logTime('D/M h:m:s') + logMode + '/ ' + data);
	});

	odiPgm.stderr.on('data', function(data){ // Template log error
		console.error(utils.logTime('D/M h:m:s') + logMode + '_ERROR/ ' + data);
	});
	
	odiPgm.on('exit', function(code){ // SetUpRestart Actions
		spawn('sh', [CORE_PATH + 'sh/mute.sh']);  // Mute // + LEDS ???
		odiState = false;
		console.log('\r\n-----------------------------------' + (code>10 ? (code>100 ? '---' : '--') : '-'));
		console.log('>> Odi\'s CORE restarting... [code:' + code + ']\r\n\r\n');
		if(typeof code === 'number' && code > 0){
			startOdi(code);
		}else{
			startOdi();
		}
	});
};

function getLogMode(){
	value = etat.readSync();
	if(value != etat.readSync()){
		getLogMode();
	}
	if(1 == value) return ' ODI';
	else return ' Odi';
}

var decrementInterval;
/** Funtion to decrement time (time before wake up log while sleeping */
var decrementTime = function(){
	decrementInterval = setInterval(function(){
		if(timeToWakeUp > 0){
			timeToWakeUp = timeToWakeUp - 1;
			logMode = ' O...' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
			// console.log('decrementTime : ' + timeToWakeUp);
		}else{
			// console.log('timeToWakeUp <= 0 [' + timeToWakeUp + ']  clearInterval !'); clearInterval(decrementInterval); // return;
		}
	}, 60*1000);
};
