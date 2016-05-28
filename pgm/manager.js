#!/usr/bin/env node

console.log(' -> Manager Initiating...');

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var gpioPins = require('./lib/gpioPins.js');
var fs = require('fs');
var request = require('request');
var utils = require('./lib/utils.js');
var log = require('./lib/log.js');
var tts = require('./lib/tts.js');
var remote = require('./lib/remote.js');

var odiPgm;
var odiState = false;
var logoNormal = fs.readFileSync('/home/pi/odi/pgm/data/logo.properties', 'utf8').toString().split('\n');
var logoSleep = fs.readFileSync('/home/pi/odi/pgm/data/logoSleep.properties', 'utf8').toString().split('\n');

startOdi(); // Premiere initialisation

ok.watch(function(err, value){
	if(!odiState){		// Detection bouton Vert pour forcer
		startOdi();		// le lancement si besoin
	}
});

var logMode;
var timeToWakeUp;
/** Fonction demarrage programme Odi */
function startOdi(mode){
	utils.mute();
	var logo;
	// console.log('typeof mode ' + typeof mode);
	// console.log('manager.startOdi.mode : ' + mode);
	if(typeof mode === 'undefined') mode = '';
	// if(typeof mode === Number){
	if(/\d/.test(mode) && mode > 0){
		timeToWakeUp = mode * 60; // Conversion en minutes
		logMode = ' Odi...' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
		logo = logoSleep;
		odiPgm = spawn('node', ['/home/pi/odi/pgm/odiSleep.js', mode]);
		decrementTime();
	}else{
		timeToWakeUp = 0;
		logMode = ' Odi';
		logo = logoNormal;
		odiPgm = spawn('node', ['/home/pi/odi/pgm/odi.js', mode]);
	}

	logo = '\n\n' + logo.join('\n');// + '\nodiState:' + odiState;
	console.log(logo);
	// log.recordLog(logo);

	odiState = true;
	var date;
	// var year;
	var month;
	var day;
	var hour;
	var min;
	var sec;
	var logDate;
	odiPgm.stdout.on('data', function(data){ // Template log output
		if(1 === etat.readSync()){ logMode = logMode.replace('Odi','ODI'); }
		else{ logMode = logMode.replace('ODI','Odi'); }
		date = new Date();
		month = date.getMonth()+1;
		day = date.getDate();
		hour = date.getHours();
		min = date.getMinutes();
		sec = date.getSeconds();
		logDate = (day<10?'0':'') + day + '/' + (month<10?'0':'') + month + ' ';//' + year + ' ';
		logDate = logDate + (hour<10?'0':'') + hour + ':' + (min<10?'0':'') + min + ':' + (sec<10?'0':'') + sec;
		console.log(logDate + logMode + '/ ' + data);// + '\r\n'
		// log.recordLog(logDate + ' Odi/ ' + data);
	});

	odiPgm.stderr.on('data', function(data){ // Template log error
		if(1 === etat.readSync()){ logMode = logMode.replace('i','!'); }
		else{ logMode = logMode.replace('!','i'); }
		date = new Date();
		month = date.getMonth()+1;
		day = date.getDate();
		hour = date.getHours();
		min = date.getMinutes();
		sec = date.getMinutes();
		logDate = (day<10?'0':'') + day + '/' + (month<10?'0':'') + month + ' ';//' + year + ' ';
		logDate = logDate + (hour<10?'0':'') + hour + ':' + (min<10?'0':'') + min + ':' + (sec<10?'0':'') + sec;
		console.log(logDate + logMode + '_ERROR/ ' + data);// + '\r\n'
		// log.recordLog(hour + ':' + min + ':' + sec + ' O/!\\ ' + data);
	});
	
	odiPgm.on('exit', function(code){ // SetUpRestart Actions
		tts.clearLastTTS();
		utils.mute();
		odiState = false;
		console.log('\r\n>> Exit Odi Pgm [code:' + code + ']');
		console.log('************************\r\n\r\n');
		// console.log('Code. : '+code);
		if(typeof code === 'number' && code > 0){
			startOdi(code);
		}else{
			startOdi();
		}
	});
	remote.synchro('log');
}

var decrementInterval;
/** Fonction decrementTime : maj temps avant reveil pour logs */
var decrementTime = function(){
	decrementInterval = setInterval(function(){
		if(timeToWakeUp > 0){
			timeToWakeUp = timeToWakeUp - 1;
			logMode = ' Odi...' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
			console.log('decrementTime : ' + timeToWakeUp);
		}else{
			console.log('timeToWakeUp <= 0 [' + timeToWakeUp + ']  clearInterval !');
			clearInterval(decrementInterval);
			// return;
		}
	}, 60*1000);
};
exports.decrementTime = decrementTime;
