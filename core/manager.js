#!/usr/bin/env node

/** Odi's global variables  */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';

/** Setting up Odi's config */
global.CONFIG = require(CONFIG_FILE);

var fs = require('fs');
var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var gpioPins = require('./modules/gpioPins.js');
var utils = require('./modules/utils.js');
// var tts = require('./modules/tts.js');

var odiPgm, odiState = false;
var logoNormal = fs.readFileSync(DATA_PATH + 'odiLogo.properties', 'utf8').toString().split('\n');
var logoSleep = fs.readFileSync(DATA_PATH + 'odiLogoSleep.properties', 'utf8').toString().split('\n');

/* ------------- START CORE -------------*/
console.log('\r\n---------------------------\r\n>> Odi\'s CORE initiating...');

startOdi(); // First initialisation

ok.watch(function(err, value){
	if(!odiState){		// Detection bouton Vert pour forcer
		startOdi();		// le lancement si besoin
	}
});

var logDate, logMode, timeToWakeUp;
var date, month, day, hour, min, sec;

/** Fonction demarrage programme Odi */
function startOdi(mode){
	utils.mute();
	var logo;
	if(typeof mode === 'undefined') mode = '';
	// if(typeof mode === Number){
	if(/\d/.test(mode) && mode == 255){
		logMode = ' O...';
		logo = logoSleep;
		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js', mode]);
	}else if(/\d/.test(mode) && mode > 0 && mode < 255){
		timeToWakeUp = mode * 60; // Conversion en minutes
		logMode = ' O...' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
		logo = logoSleep;
		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js', mode]);
		decrementTime();
	}else{
		timeToWakeUp = 0;
		logMode = ' Odi';
		logo = logoNormal;
		odiPgm = spawn('node', [CORE_PATH + 'odi.js', mode]);
	}

	logo = '\n\n' + logo.join('\n');
	console.log(logo);

	odiState = true;
	odiPgm.stdout.on('data', function(data){ // Template log output
		if(1 === etat.readSync()){ logMode = logMode.replace('Odi','ODI'); }
		else{ logMode = logMode.replace('ODI','Odi'); }
		// console.log(logDate + logMode + '/ ' + data);// + '\r\n'
		if(CONFIG.debug) console.log(utils.formatedDate() + logMode + ' >_  ' + data);// + '\r\n'
		else console.log(utils.formatedDate() + logMode + '/ ' + data);// + '\r\n'
	});

	odiPgm.stderr.on('data', function(data){ // Template log error
		if(1 === etat.readSync()){ logMode = logMode.replace('i','!'); }
		else{ logMode = logMode.replace('!','i'); }
		// console.log(logDate + logMode + '_ERROR/ ' + data);// + '\r\n'
		if(CONFIG.debug) console.trace(utils.formatedDate() + logMode + '_ERROR >_ ' + data);// + '\r\n'
		else console.error(utils.formatedDate() + logMode + '_ERROR/ ' + data);// + '\r\n'
	});
	
	odiPgm.on('exit', function(code){ // SetUpRestart Actions
		// tts.clearLastTTS();
		utils.mute();
		odiState = false;
		console.log('\r\n-----------------------------------' + (code>10 ? (code>100 ? '---' : '--') : '-'));
		console.log('>> Odi\'s CORE restarting... [code:' + code + ']\r\n\r\n');
		if(typeof code === 'number' && code > 0){
			startOdi(code);
		}else{
			startOdi();
		}
	});
}

var decrementInterval;
/** Fonction decrementTime : MaJ temps avant reveil pour logs */
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
