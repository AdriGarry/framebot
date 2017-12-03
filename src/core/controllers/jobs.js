#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var CronJob = require('cron').CronJob;
var spawn = require('child_process').spawn;

var date = new Date();
var hour = date.getHours();
var pastHour = hour;

var Flux = require(Odi._CORE + 'Flux.js');

if (Odi.conf.mode != 'sleep') {
	initClock();
	setAutoSleep();
	setInteractiveJobs();
	setBackgroundJobs();
	// }else{
}

/** Function to init clock  */
function initClock() {
	if (true) {
		// Mode work
		new CronJob(
			'0 0,30 8-23 * * 1-5',
			function() {
				Flux.next('service', 'time', 'now');
			},
			null,
			true,
			'Europe/Paris'
		);
		new CronJob(
			'0 0,30 12-23 * * 0,7',
			function() {
				Flux.next('service', 'time', 'now');
			},
			null,
			true,
			'Europe/Paris'
		);
		log.info('Clock jobs initialised in regular mode');
	} else {
		// Mode any time
		new CronJob(
			'0 0,30 * * * *',
			function() {
				Flux.next('service', 'time', 'now');
			},
			null,
			true,
			'Europe/Paris'
		);
		log.info('Clock jobs initialised in any time mode');
	}
}

/** Function to set alarms */
function setInteractiveJobs() {
	// WEEKDAY
	// new CronJob('0 16 7,8 * * 1-5', function() {
	// 	Flux.next('module', 'tts', 'speak', { lg: 'fr', voice: 'espeak', msg: 'Je crois qu\'il faut lancer l\'opairation baluchon' });
	// }, null, true, 'Europe/Paris');

	new CronJob(
		'0 18,20,22-25 8 * * 1-5',
		function() {
			if (Utils.random()) Flux.next('module', 'tts', 'speak', { lg: 'fr', msg: 'Go go go, allez au boulot' });
			else Flux.next('module', 'tts', 'speak', { lg: 'fr', voice: 'espeak', msg: 'Allez allez, Maitro boulot dodo' });
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'0 15 18 * * 1-5',
		function() {
			//Flux.next('service', 'music', 'fip');
			Utils.testConnexion(function(connexion) {
				setTimeout(function() {
					if (connexion == true) {
						Flux.next('service', 'music', 'fip');
					} else {
						Flux.next('service', 'music', 'jukebox');
					}
				}, 3000);
			});
		},
		null,
		true,
		'Europe/Paris'
	);

	// ALL DAYS
	new CronJob(
		'0 1 13 * * *',
		function() {
			log.info('Il est 13 heures et tout va bien !');
			spawn('sh', [Odi._SHELL + 'sounds.sh', '13Heures']);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'0 40 18,19 * * *',
		function() {
			Flux.next('module', 'tts', 'speak', {
				lg: 'fr',
				voice: 'espeak',
				msg: "Je crois qu'il faut lancer l'opairation baluchon"
			});
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'13 13,25,40,51 17-22 * * *',
		function() {
			Flux.next('service', 'interaction', 'random');
		},
		null,
		true,
		'Europe/Paris'
	);
	log.info('Interactive jobs initialised');
}

/** Function to set auto sleep life cycles */
function setAutoSleep() {
	new CronJob(
		'2 0 0 * * 1-5',
		function() {
			goToSleep();
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'2 0 2 * * 0,6',
		function() {
			goToSleep();
		},
		null,
		true,
		'Europe/Paris'
	);
	log.info('Auto Sleep Life Cycle jobs initialised');
}

/** Function to random TTS ggood night. NOT EXPORTED! */
function goToSleep() {
	var rdmSleepTTS = Utils.random(Odi.ttsMessages.goToSleep.length);
	var sleepTTS = Odi.ttsMessages.goToSleep[rdmSleepTTS];
	Flux.next('module', 'tts', 'speak', sleepTTS);
	log.info('AutoLifeCycle go to sleep !');
	setTimeout(function() {
		Flux.next('service', 'system', 'restart', 'sleep');
	}, sleepTTS.msg.length * 150);
}

/** Function to set background tasks */
function setBackgroundJobs() {
	new CronJob(
		'13 13 13 * * 1-6',
		function() {
			Flux.next('module', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Auto restart' }); // Daily restart Odi's core
			setTimeout(function() {
				Flux.next('service', 'system', 'restart');
			}, 3000);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'13 13 13 * * 0',
		function() {
			Flux.next('module', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Reset config' }); // Weekly RPI reboot
			setTimeout(function() {
				log.info('resetCfg'); // Weekly cleaning of logs
				Flux.next('module', 'conf', 'reset', true);
			}, 3000);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'15 15 13 * * 0',
		function() {
			Flux.next('module', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Auto reboot' }); // Weekly RPI reboot
			setTimeout(function() {
				Flux.next('service', 'system', 'restart');
			}, 3000);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'0 0 5 * * 1',
		function() {
			log.info('Clean log files  /!\\'); // Weekly cleaning of logs
			Flux.next('module', 'hardware', 'cleanLog');
		},
		null,
		true,
		'Europe/Paris'
	);
}
