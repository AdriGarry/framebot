#!/usr/bin/env node

/** Params detection */
// const lastUpdated = process.argv[2];

/** Odi's global variables  */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';

console.debug = function(o){}; // debug init to false

var fs = require('fs');
var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var utils = require(CORE_PATH + 'modules/utils.js');
var leds = require(CORE_PATH + 'modules/leds.js');

utils.getLastModifiedDate([CORE_PATH, WEB_PATH, DATA_PATH], function(lastUpdate){
	utils.setDefaultConfig({update: lastUpdate}, false);
});

var odiPgm, odiState = false, errorLimit = 1;
const logoNormal = fs.readFileSync(DATA_PATH + 'odiLogo.properties', 'utf8').toString().split('\n');
const logoSleep = fs.readFileSync(DATA_PATH + 'odiLogoSleep.properties', 'utf8').toString().split('\n');


/* ------------- START CORE -------------*/
console.log('\r\n>> Odi\'s CORE started');

startOdi(); // First init

ok.watch(function(err, value){
	if(!odiState){ // Watch green button to force start... DEPRECATED ???
		utils.setConfig({mode: 'ready'});
		startOdi();
	}
});

var logDate, logMode = getLogMode(), timeToWakeUp;
var date, month, day, hour, min, sec;

/** Function to start up Odi */
function startOdi(exitCode){
	global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
	spawn('sh', [CORE_PATH + 'sh/mute.sh']); // Mute // + LEDS ???

	var logo;
	// console.log('==> CONFIG.mode', CONFIG.mode);
	// console.log('==> exitCode', exitCode);
	if(CONFIG.mode == 'sleep' || typeof exitCode === 'number' && exitCode > 0){
		logMode = ' O';// inutile (cf getLogMode())
		logo = logoSleep;
		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js'/*, mode*/]);
	// }else if(CONFIG.mode == 'ready'){
	}else{
		timeToWakeUp = 0;
		logMode = ' Odi';// inutile (cf getLogMode())
		logo = logoNormal;
		odiPgm = spawn('node', [CORE_PATH + 'odi.js'/*, exitCode*/]);
	}

	console.log('\n\n' + logo.join('\n'));

	// utils.execCmd('find /home/pi/odi/core -printf "%T+\n" | sort -nr | head -n 1', function(data){
	// 	// console.log('updateLastModifiedTime()', data);
	// 	data = data.substring(0, data.indexOf(".")-3).replace('+',' ');
	// 	// Possibilité de comparer les dates de cette façon: console.log(new Date('2017-04-26 01:06')) OU voir: http://stackoverflow.com/questions/7559555/last-modified-file-date-in-node-js
	// 	// console.log('data2', data);
	// 	utils.setDefaultConfig({update: data});
	// 	if(CONFIG.update != data){
	// 		utils.setConfig({startTime: utils.logTime('h:m (D/M)'), update: data}, false);
	// 	}else{
	// 		utils.setConfig({startTime: utils.logTime('h:m (D/M)')}, false);
	// 	}
	// });
	utils.setConfig({startTime: utils.logTime('h:m (D/M)')}, false);

	etat.watch(function(err, value){
		logMode = getLogMode();
	});

	odiState = true;
	odiPgm.stdout.on('data', function(data){ // Template log output
		console.log(utils.logTime('D/M h:m:s') + logMode + '/ ' + data);
	});

	odiPgm.stderr.on('data', function(data){ // Template log error
		if(CONFIG.mode == 'ready') spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'error']);
		setTimeout(function(){
			leds.altLeds(30, 1.5);
		}, 1500);
		console.error(utils.logTime('D/M h:m:s') + logMode + '_ERROR/ ' + data);
	});
	
	odiPgm.on('exit', function(code){ // SetUpRestart Actions
		spawn('sh', [CORE_PATH + 'sh/mute.sh']);  // Mute // + LEDS ???
		odiState = false;
		console.log('\r\n-----------------------------------' + (code>10 ? (code>100 ? '---' : '--') : '-'));
		console.log('>> Odi\'s CORE restarting... [code:' + code + ']\r\n\r\n');
		startOdi(code);
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


// function OLDstartOdi(mode){
// 	/** Setting up Odi's config */
// 	global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
// 	spawn('sh', [CORE_PATH + 'sh/mute.sh']); // Mute // + LEDS ???
// 	var logo;
// 	if(typeof mode === 'undefined') mode = '';
// 	// if(typeof mode === Number){
// 	if(/\d/.test(mode) && mode == 255){
// 		logMode = ' O';
// 		logo = logoSleep;
// 		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js', mode]);
// 	}else if(/\d/.test(mode) && mode > 0 && mode < 255){
// 		timeToWakeUp = mode * 60; // Convert to minutes
// 		logMode = ' O' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
// 		logo = logoSleep;
// 		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js', mode]);
// 		decrementTime();
// 	}else{
// 		timeToWakeUp = 0;
// 		logMode = ' Odi';
// 		logo = logoNormal;
// 		odiPgm = spawn('node', [CORE_PATH + 'odi.js', mode]);
// 	}
// 	console.log('\n\n' + logo.join('\n'));
// 	etat.watch(function(err, value){
// 		logMode = getLogMode();
// 	});
// 	odiState = true;
// 	odiPgm.stdout.on('data', function(data){ // Template log output
// 		console.log(utils.logTime('D/M h:m:s') + logMode + '/ ' + data);
// 	});
// 	odiPgm.stderr.on('data', function(data){ // Template log error
// 		console.error(utils.logTime('D/M h:m:s') + logMode + '_ERROR/ ' + data);
// 	});
// 	odiPgm.on('exit', function(code){ // SetUpRestart Actions
// 		spawn('sh', [CORE_PATH + 'sh/mute.sh']);  // Mute // + LEDS ???
// 		odiState = false;
// 		console.log('\r\n-----------------------------------' + (code>10 ? (code>100 ? '---' : '--') : '-'));
// 		console.log('>> Odi\'s CORE restarting... [code:' + code + ']\r\n\r\n');
// 		if(typeof code === 'number' && code > 0){
// 			startOdi(code);
// 		}else{
// 			startOdi();
// 		}
// 	});
// };
