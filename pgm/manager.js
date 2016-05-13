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
var logoNormal = fs.readFileSync('/home/pi/odi/pgm/data/logoSleep.properties', 'utf8').toString().split('\n');
var logoSleep = fs.readFileSync('/home/pi/odi/pgm/data/logo.properties', 'utf8').toString().split('\n');
// var mute;

// setInterval(function(){
	// led.write(0);
// }, 10*1000);

startOdi();

ok.watch(function(err, value){
	if(!odiState){
		startOdi();
	}
});

/** Fonction demarrage programme */
function startOdi(mode){
	// mute = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	utils.mute();
	var logo;
	var logMode;
	if(typeof mode === 'undefined') mode = '';
	// if(mode == 'sleep'){
	if(mode.indexOf('sleep') > -1){
		if(mode == 'sleepWakeUp'){// || 1 === etat.readSync()){
			mode = 'sleepWakeUp';
			logMode = ' OdiSleep!';
		}else{
			logMode = ' OdiSleep';
		}
		logo = logoNormal;
		odiPgm = spawn('node', ['/home/pi/odi/pgm/odiSleep.js', mode]);
	}else{
		logMode = ' Odi';
		logo = logoSleep;
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
	odiPgm.stdout.on('data', function(data){
		if(1 === etat.readSync()){ logMode = logMode.replace('Odi','ODI'); }
		else{ logMode = logMode.replace('ODI','Odi'); }
		date = new Date();
		month = date.getMonth();
		day = date.getDate();
		hour = date.getHours();
		min = date.getMinutes();
		sec = date.getSeconds();
		logDate = (day<10?'0':'') + day + '/' + (month<10?'0':'') + month + ' ';//' + year + ' ';
		logDate = logDate + (hour<10?'0':'') + hour + ':' + (min<10?'0':'') + min + ':' + (sec<10?'0':'') + sec;
		console.log(logDate + logMode + '/ ' + data + '\r\n');
		// log.recordLog(logDate + ' Odi/ ' + data);
	});

	odiPgm.stderr.on('data', function(data){
		if(1 === etat.readSync()){ logMode = logMode.replace('i','!'); }
		else{ logMode = logMode.replace('!','i'); }
		date = new Date();
		month = date.getMonth();
		day = date.getDate();
		hour = date.getHours();
		min = date.getMinutes();
		sec = date.getMinutes();
		logDate = (day<10?'0':'') + day + '/' + (month<10?'0':'') + month + ' ';//' + year + ' ';
		logDate = logDate + (hour<10?'0':'') + hour + ':' + (min<10?'0':'') + min + ':' + (sec<10?'0':'') + sec;
		console.log(logDate + logMode + '_ERROR/ ' + data + '\r\n');
		// log.recordLog(hour + ':' + min + ':' + sec + ' O/!\\ ' + data);
	});
	
	odiPgm.on('exit', function(code){
		// mute = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
		tts.clearLastTTS();
		utils.mute();
		odiState = false;
		console.log('\r\n>> Odi pgm KILLED  /!\\  /!\\');
		console.log('***************************\r\n\r\n');
		console.log('Code. : '+code);
		if(code == 13){
			startOdi('sleep');
		}else if(code == 14){
			startOdi('sleepWakeUp');
		}else{
			startOdi();
		}
	});
	remote.check('log');
}