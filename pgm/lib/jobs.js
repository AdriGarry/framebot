#!/usr/bin/env node

// Module Jobs [horloge, alarmes & taches de fond]

var spawn = require('child_process').spawn;
var fs = require('fs');
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

// var clockPattern;
/** Fontion d'initialisation de l'horloge (jobs associes) */
var startClock = function(modeInit){
	if(!modeInit){ // Mode work
		console.log('Clock jobs initialised in regular mode');
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
	}else{ // Mode any time
		console.log('Clock jobs initialised in any time mode !');
		new CronJob('0 0 * * * *', function(){
			ringHour();
		}, null, true, 'Europe/Paris');
		new CronJob('0 30 * * * *', function(){
			ringHalfHour();
		}, null, true, 'Europe/Paris');
	}
};
exports.startClock = startClock;

/** Fontion signal heure */
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

/** Fontion signal demi-heure */
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


/*exports.setupJobs = function setupJobs(){
	console.log('setup jobs in progress...');
	var jobsData;
	fs.readFile('/home/pi/odi/pgm/data/jobs.json', 'utf8', function (err, data) {
		console.log(data);
		if (err) throw err;
		jobsData = JSON.parse(data);
	});
	console.log(jobsData);
};*/


/** Fontion d'initialisation des alarmes et des taches de fond (jobs associes) */
var setAlarms = function(){
	console.log('Alarms jobs initialised');

	// WEEKDAY
//	new CronJob('0 26 7 * * 1-5', function(){
	new CronJob('0 10 7 * * 1-5', function(){
		console.log('Morning Sea... Let\'s start the day with some waves !');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'MorningSea']);
	}, null, true, 'Europe/Paris');

//	new CronJob('0 29 7 * * 1-5', function(){
	new CronJob('0 13 7 * * 1-5', function(){
		console.log('COCORICO !!');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
		utils.testConnexion(function(connexion){
			if(connexion == true){
				setTimeout(function(){
					service.time();
				}, 4000);
				setTimeout(function(){
					//service.weather();
					service.sayOdiAge();
				}, 7*1000);
				setTimeout(function(){
					fip.playFip();
				}, 13*1000);
			}else{
				jukebox.loop();
			}
			utils.autoMute('Auto mute Morning');
		});
	}, null, true, 'Europe/Paris');

	new CronJob('0 15,18-20 8 * * 1-5', function(){
		console.log('COCORICO !!');
		tts.speak('fr', 'go go go, allez au boulot:1');
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

	// WEEKEND
	new CronJob('0 45,55 11 * * 0,6', function() {
		console.log('Morning Birds... Let\'s start the day with some birds songs !');
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
				}, 15*1000);
			// }else{
				// jukebox.loop();
			// }
			utils.autoMute('Auto mute Morning');
		});

	}, null, true, 'Europe/Paris');

	// ALL DAYS
	new CronJob('0 1 13 * * *', function() {
		console.log('Il est 13 heures et tout va bien !');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', '13Heures']);
	}, null, true, 'Europe/Paris');

	new CronJob('13 15,45 17-22 * * *', function(){
		// tts.conversation('RANDOM'); // Conversations aleatoires dans la journee
		utils.randomAction();
	}, null, true, 'Europe/Paris'); // Signal des 1/4 d'heure, entre 17h et 23h
};
exports.setAlarms = setAlarms;

// renvoyer param -1 pour le mode veille sans reveil automatique ?
// (du coup envoyer -1 comme param par défaut depuis la remote !?)
/** Fontion d'initialisation des taches de fond en mode veille */
var setAutoLifeCycle = function(param){
	if(typeof param !== 'undefined' && param == 'S'){ // Set wake up jobs
		console.log('AutoLifeCycle jobs initialised [' + param + ':Wake Up!]');
		// new CronJob('0 25 7 * * 1-5', function(){
		new CronJob('0 9 7 * * 1-5', function(){
			console.log('AutoLifeCycle start up !');
			utils.restartOdi(); // redemarrer pgm
		}, null, true, 'Europe/Paris');
		new CronJob('0 42 11 * * 0,6', function() {
			console.log('AutoLifeCycle start up !');
			utils.restartOdi(); // redemarrer pgm
		}, null, true, 'Europe/Paris');
	}else{ // Set go to sleep jobs
		console.log('AutoLifeCycle jobs initialised [for time to sleep]');
		new CronJob('13 0 0 * * 1-5', function(){
			console.log('AutoLifeCycle go to sleep !');
			utils.restartOdi(255);// mettre en veille // 7
		}, null, true, 'Europe/Paris');
		new CronJob('13 0 2 * * 0,6', function() {
			console.log('AutoLifeCycle go to sleep !');
			utils.restartOdi(255);// mettre en veille // 9
		}, null, true, 'Europe/Paris');
	}
};exports.setAutoLifeCycle = setAutoLifeCycle;

/** Fontion d'initialisation des taches de fond */
var setBackgroundJobs = function(){
	console.log('Background jobs initialised');
	new CronJob('13 13 13 * * 1-6', function() {
		tts.speak('en','Auto restart:1'); // Reinitialisation quotidienne
		setTimeout(function(){
			utils.restartOdi();
		}, 3000);
	}, null, true, 'Europe/Paris');

	new CronJob('13 13 13 * * 0', function() {
		tts.speak('fr','Auto reboot:1'); // Redemarrage hebdomadaire
		setTimeout(function(){
			utils.reboot();
		}, 3000);
	}, null, true, 'Europe/Paris');

	new CronJob('0 0 5 * * 2', function() {
		console.log('Clean log files  /!\\'); // Nettoyage des logs hebdomadaire
		log.cleanLog();
	}, null, true, 'Europe/Paris');
};
exports.setBackgroundJobs = setBackgroundJobs;
