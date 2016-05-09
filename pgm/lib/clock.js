#!/usr/bin/env node
// Module Horloge & Alarmes

var spawn = require('child_process').spawn;
var CronJob = require('cron').CronJob;
var utils = require('./utils.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');
var service = require('./service.js');
var log = require('./log.js');

var date = new Date();
var hour = date.getHours();
var pastHour = hour;

var clockPattern;
var startClock = function(modeInit){
	if(!modeInit){
		console.log('Cron Clock in regular mode     -.-');
		new CronJob('0 0 8-23 * * 1-5', function(){
			ringHour();
		}, null, true, 'Europe/Paris');
		new CronJob('0 30 8-23 * * 1-5', function(){
			ringHalfHour();
		}, null, true, 'Europe/Paris');
		new CronJob('0 0 12-23 * * 0,7', function(){
			ringHour();
		}, null, true, 'Europe/Paris');
		new CronJob('0 30 12-23 * * 0,7', function(){
			ringHalfHour();
		}, null, true, 'Europe/Paris');
	}else{
		console.log('Cron Clock in full mode');
		new CronJob('0 0 * * * *', function(){
			ringHour();
		}, null, true, 'Europe/Paris');
		new CronJob('0 30 * * * *', function(){
			ringHalfHour();
		}, null, true, 'Europe/Paris');
	}
};
exports.startClock = startClock;

var ringHour = function(){
	date = new Date();
	hour = date.getHours();
	console.log('It\'s ' + hour + ' o\'clock');
	utils.testConnexion(function(connexion){
		if(connexion == true){
			tts.speak('fr', 'Il est ' + hour + ' heures');
		}else{
			if(cpHour > 12){
				cpHour = hour - 12;
			} else if(cpHour == 0){
				cpHour = 12;
			}
			var oClock = setInterval(function(){
				console.log('RING BELL ' + cpHour);
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh']);
				cpHour--;
				if(cpHour < 1){clearInterval(oClock);}
			}, 1100);
		}
	});
};

var ringHalfHour = function(){
	date = new Date();
	hour = date.getHours();
	console.log('It\'s ' + hour + ' and a half');
	utils.testConnexion(function(connexion){
		if(connexion == true){
			// if(cpHour > 12){cpHour = hour - 12};
			tts.speak('fr', 'Il est ' + hour + ' heures 30');
		}else{
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'half']);
		}
	});
};

var setAlarms = function(){
	console.log('Cron Alarms On');

	new CronJob('0 26 7 * * 1-5', function(){
		console.log('Morning Sea...');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'MorningSea']);
	}, null, true, 'Europe/Paris');

	new CronJob('0 29 7 * * 1-5', function(){
		console.log('COCORICO !!');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
		utils.testConnexion(function(connexion){
			if(connexion == true){
				service.time();
				setTimeout(function(){
					service.weather();
				}, 5*1000);
				setTimeout(function(){
					fip.playFip();
				}, 15*1000);
			}else{
				jukebox.loop();
			}
			utils.autoMute('Auto mute Morning');
		});
	}, null, true, 'Europe/Paris');

	new CronJob('0 32,40,45,55 7 * * 1-5', function(){
	// new CronJob('0 * * * * *', function(){
		tts.conversation(1); // Jounee interessante
	}, null, true, 'Europe/Paris');

	new CronJob('0 30 18 * * 1-5', function() {
		utils.testConnexion(function(connexion){
			setTimeout(function(){
				if(connexion == true){
					fip.playFip();
				}else{
					jukebox.loop();
				}
				utils.autoMute('Auto mute Evening Fip');
			}, 3000);
		});
	}, null, true, 'Europe/Paris');

	new CronJob('0 45,55 11 * * 0,6', function() {
		console.log('Morning Birds...');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'MorningBirds']);
	}, null, true, 'Europe/Paris');

	new CronJob('0 0 12 * * 0,6', function() {
		console.log('COCORICO !!');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
		utils.testConnexion(function(connexion){
			// if(connexion == true){
				service.time();
				setTimeout(function(){
					service.weather();
				}, 5*1000);
				setTimeout(function(){
					fip.playFip();
					// console.log('Il Est Midi !!!!!!');
					// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'IlEstMidi']);
				}, 15*1000);
			// }else{
				// jukebox.loop();
			// }
			utils.autoMute('Auto mute Morning');
		});

	}, null, true, 'Europe/Paris');

	new CronJob('0 45 15-23 * * *', function(){
		tts.conversation(1); // Jounee interessante
	}, null, true, 'Europe/Paris');


	new CronJob('0 13 13 * * *', function() {
		tts.speak('fr','Auto reboot:0');
		setTimeout(function(){
			utils.reboot();
		}, 3000);
	}, null, true, 'Europe/Paris');

	new CronJob('0 12 12 * * *', function() {
		console.log('Il Est Midi !!!!!!');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'IlEstMidi']);
	}, null, true, 'Europe/Paris');

	new CronJob('0 0 5 * * 2', function() {
		console.log('Clean log files  /!\\');
		log.cleanLog();
	}, null, true, 'Europe/Paris');
};
exports.setAlarms = setAlarms;
