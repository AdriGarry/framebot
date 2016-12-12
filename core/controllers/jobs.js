#!/usr/bin/env node

// Module Jobs [clock, alarms & background tasks]

var spawn = require('child_process').spawn;
var fs = require('fs');
var CronJob = require('cron').CronJob;
var hardware = require(CORE_PATH + 'modules/hardware.js');
var utils = require(CORE_PATH + 'modules/utils.js');
var fip = require(CORE_PATH + 'modules/fip.js');
var jukebox = require(CORE_PATH + 'modules/jukebox.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var service = require(CORE_PATH + 'modules/service.js');
var time = require(CORE_PATH + 'modules/time.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');

var date = new Date();
var hour = date.getHours();
var pastHour = hour;

module.exports = {
	startClock: startClock,
	setJobs: setJobs, // RENOMMER FONCTION !!!
	setAutoSleep: setAutoSleep,
	setBackgroundJobs: setBackgroundJobs
};

/** Function to init clock  */
function startClock(modeInit){
	if(!modeInit){ // Mode work
		console.log('Clock jobs initialised in regular mode');
		// new CronJob('0 0,30 8-23 * * 1-5', function(){
		new CronJob('0 0,30 8-23 * * 1-5', function(){
			time.now();
		}, null, true, 'Europe/Paris');
		new CronJob('0 0,30 12-23 * * 0,7', function(){
			time.now();
		}, null, true, 'Europe/Paris');
	}else{ // Mode any time
		console.log('Clock jobs initialised in any time mode !');
		new CronJob('0 0,30 * * * *', function(){
			time.now();
		}, null, true, 'Europe/Paris');
	}
};

/** Function to set alarms */
function setJobs(){
	console.log('Alarms jobs initialised');

	// WEEKDAY
	new CronJob('0 20,22-25 8 * * 1-5', function(){
		tts.speak({lg:'fr', voice: 'espeak', msg:'go go go, allez au boulot'});
	}, null, true, 'Europe/Paris');

	new CronJob('0 30 18 * * 1-5', function(){
		utils.testConnexion(function(connexion){
			setTimeout(function(){
				if(connexion == true){
					fip.playFip();
				}else{
					jukebox.loop();
				}
			}, 3000);
		});
	}, null, true, 'Europe/Paris');

	// ALL DAYS
	new CronJob('0 1 13 * * *', function(){
		console.log('Il est 13 heures et tout va bien !');
		spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', '13Heures']);//var deploy = 
	}, null, true, 'Europe/Paris');

	new CronJob('13 15,45 17-22 * * *', function(){
		// tts.randomConversation(); // Conversations aleatoires dans la journee
		service.randomAction();
	}, null, true, 'Europe/Paris'); // Signal des 1/4 d'heure, entre 17h et 23h
};

/** Function to set auto sleep life cycles */
function setAutoSleep(){
	console.log('Auto Sleep Life Cycle jobs initialised');
	new CronJob('3 0 0 * * 1-5', function(){
		console.log('AutoLifeCycle go to sleep !');
		hardware.restartOdi(255);
	}, null, true, 'Europe/Paris');

	new CronJob('3 0 2 * * 0,6', function(){
		console.log('AutoLifeCycle go to sleep !');
		hardware.restartOdi(255);
	}, null, true, 'Europe/Paris');
};

/** Function to set background tasks */
function setBackgroundJobs(){
	console.log('Background jobs initialised');

	new CronJob('13 13 13 * * 1-6', function(){
		tts.speak({voice:'espeak', lg:'en', msg:'Auto restart'}); // Daily restart Odi's core
		setTimeout(function(){
			hardware.restartOdi();
		}, 3000);
	}, null, true, 'Europe/Paris');

	new CronJob('13 13 13 * * 0', function(){
		tts.speak({voice:'espeak', lg:'fr', msg:'Auto reboot'}); // Weekly RPI reboot
		setTimeout(function(){
			//hardware.reboot(); // A REMETTRE UNE FOIS LE SCRIPT DE DEMARRAGE OK !!
		}, 3000);
	}, null, true, 'Europe/Paris');

	new CronJob('0 0 5 * * 2', function(){
		console.log('Clean log files  /!\\'); // Weekly cleaning of logs
		hardware.cleanLog();
	}, null, true, 'Europe/Paris');
};
