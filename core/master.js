#!/usr/bin/env node

/** Params detection */
// const lastUpdated = process.argv[2];

/** Odi's global variables */
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

global.ODI = {};
global.ODI.utils = require(CORE_PATH + 'modules/utils.js');
global.ODI.core = require(CORE_PATH + 'modules/core.js');
global.ODI.config = require(CORE_PATH + 'modules/config.js');
global.ODI.leds = require(CORE_PATH + 'modules/leds.js');

ODI.config.getLastModifiedDate([CORE_PATH, WEB_PATH, DATA_PATH], function(lastUpdate){
	ODI.config.updateDefault({update: lastUpdate}, false);
});

console.log('\r\n>> Odi\'s CORE started');

/** Function to start up Odi */
(function startOdi(exitCode){
	ODI.leds.blink({leds: ['nose'], speed: 2000, loop: 1});
	global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
	var odiCore, logMode = getLogMode();
	spawn('sh', [CORE_PATH + 'sh/mute.sh']); // Mute

	if(CONFIG.mode == 'sleep' || typeof exitCode === 'number' && exitCode > 0){
		odiCore = spawn('node', [CORE_PATH + 'odiSleep.js'/*, mode*/]);
	}else{
		odiCore = spawn('node', [CORE_PATH + 'odi.js'/*, exitCode*/]);
	}

	etat.watch(function(err, value){
		CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
		logMode = getLogMode();
	});

	odiCore.stdout.on('data', function(data){
		console.log(ODI.utils.logTime('D/M h:m:s') + logMode + '/ ' + data);
	});

	odiCore.stderr.on('data', function(data){
		if(CONFIG.mode == 'ready') spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'error']);
		setTimeout(function(){
			ODI.leds.altLeds(30, 1.5);
		}, 1500);
		console.error(ODI.utils.logTime('D/M h:m:s') + logMode + '_ERROR/ ' + data);
	});
	
	odiCore.on('exit', function(code){ // SetUpRestart Actions
		spawn('sh', [CORE_PATH + 'sh/mute.sh']);  // Mute // + LEDS ???
		console.log('\r\n-----------------------------------' + (code>10 ? (code>100 ? '---' : '--') : '-'));
		console.log('>> Odi\'s CORE restarting... [code:' + code + ']\r\n\r\n');
		startOdi(code);
	});
}());

function getLogMode(){
	value = etat.readSync();
	if(value != etat.readSync()){
		getLogMode();
	}
	if(value) return CONFIG.mode == 'sleep' ? ' O.' : ' ODI';
	else return CONFIG.mode == 'sleep' ? ' O' : ' Odi';
};
