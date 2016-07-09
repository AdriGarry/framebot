#!/usr/bin/env node
// Module utilitaires

// var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var remote = require('./remote.js');
var leds = require('./leds.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var exclamation = require('./exclamation.js');
var tts = require('./tts.js');
var voiceMail = require('./voiceMail.js');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
// var clock = require('./clock.js');
var service = require('./service.js');
var self = this;

/** Fonction mute */
var mute = function(message){
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	console.log(((message === undefined)? '' : message) + 'MUTE  :|');
	leds.clearLeds();
	eye.write(0);
	belly.write(0);
};
exports.mute = mute;

/** Fonction auto mute (60 minutes) */
var muteTimer;
var autoMute = function(message){
	clearTimeout(muteTimer);
	muteTimer = setTimeout(function(){
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh', 'auto']);
		setTimeout(function(){
			message = ((message === undefined)? '' : message) + 'AUTO MUTE  :|';
			fip.stopFip(message);
			deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
			leds.clearLeds();
			eye.write(0);
			belly.write(0);
		}, 1600);
		console.log(message);
	// }, 13*1000);
	}, 60*60*1000);
};
exports.autoMute = autoMute;

/** Fonction action aleatoire (exclamation, random TTS, services date, heure, meteo...) */
var randomAction = function(){
	self.testConnexion(function(connexion){
		if(!connexion){
			exclamation.exclamation2Rappels();
		}else{
			var rdm = Math.floor(Math.random()*19); // 1->13
			console.log('> randomAction [rdm = ' + rdm + ']');
			switch(rdm){
				case 1:
				case 2:
				case 3:
				case 4:
					tts.speak('','');
					break;
				case 5:
				case 6:
				case 7:
					tts.conversation('RANDOM');
					break;
				case 8:
					service.time();
					break;
				case 9:
					service.date();
					break;
				case 10:
				case 11:
					service.weather();
					break;
				case 12:
					service.cpuTemp();
					break;
				default:
					exclamation.exclamation();
			}
		}		
	});
};
exports.randomAction = randomAction;

/** Fonction de formatage des logs */
var prepareLogs = function(lines, callback){
	var logFilePath = '/home/pi/odi/log/odi.log';
	var content = fs.readFileSync(logFilePath, 'UTF-8').toString().split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	//content = self.getCPUTemp() + '\n' + content;
	callback(content);
	return content;
}
exports.prepareLogs = prepareLogs;

/** Fonction pour afficher les proprietes de l'obj passe en param */
var printObj = function(obj){
	var cache = [];
	JSON.stringify(obj, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				// Circular reference found, discard key
				console.log('Circular reference found, discard key');
				return;
			}
			// Store value in our collection
			cache.push(value);
		}
		return value;
	});
	cache = null;
	console.log('cache : ' + cache);
};
exports.printObj = printObj;

/** Fonction parse data from .properties */
var parseData = function(filePath){ // OU getData OU sliptData
var data = 'KO'; // ou undefined
	try{
		data = fs.readFileSync(filePath, 'UTF-8').toString();
	}catch(e){
		console.error('Error while reading file : ' + filePath);
		console.error(e);
	}
	try{
		if(data.indexOf('\n\n') > -1){
			data = data.split('\n\n');
		}else{
			data = data.split('\n');
		}
	}catch(e){
		console.error('Error while spliting file : ' + filePath);
		console.error(e);
	}
	return data;
};
exports.parseData = parseData;

/** Fonction getFileContent */
var getFileContent = function(filePath){
var data = 'KO'; // ou undefined
	try{
		data = fs.readFileSync(filePath, 'UTF-8').toString();
	}catch(e){
		console.error('Error while reading file : ' + filePath);
		console.error(e);
	}
	return data;
};
exports.getFileContent = getFileContent;

/** Fonction test connexion internet */
var testConnexion = function(callback){
	require('dns').resolve('www.google.com', function(err) {
		if(err){
			//console.error('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		}else{
			//console.log('Odi is online   :');
			callback(true);
		}
	});
};
exports.testConnexion = testConnexion;

/** Fonction redemarrage RPI */
var reboot = function(){
	remote.trySynchro();
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/power.sh', 'reboot']);
	}, 1500);
};
exports.reboot = reboot;

/** Fonction arret RPI */
var shutdown = function(){
	voiceMail.clearVoiceMail();
	remote.trySynchro();
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI  -- DON\'T FORGET TO SWITCH OFF POWER SUPPLY!!');
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/power.sh']);
	}, 1500);
};
exports.shutdown = shutdown;

/** Fonction redemarrage programme/mise en veille */
var restartOdi = function(mode){
	// if(typeof mode === 'number' && mode > 0){
	if(mode > 0){
		mode = parseInt(mode, 10);
		setTimeout(function(){
			console.log('Odi is going to sleep [' + mode + ']');
			process.exit(mode);
		}, 300); // Pause pour operations et clean msg
	}else{
		setTimeout(function(){
			console.log('Restarting Odi !!');
			process.exit();
			// process.exit(-1);
		}, 300); // Pause pour operations et clean msg
	}
};
exports.restartOdi = restartOdi;


/** Fonction recuperation temperature CPU */
var getCPUTemp = function(callback){
	var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(2));
	return(temperature);
};
exports.getCPUTemp = getCPUTemp;


/** Fonction recuperation dernier message commit */
var getMsgLastGitCommit = function(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: '/home/pi/odi/'}, getMsg);
};
exports.getMsgLastGitCommit = getMsgLastGitCommit;
