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

// type, subject, id, value, delay, loop, hidden
var JOBS = {
	system: [
		{
			type: '',
			subject: '',
			id: '',
			value: {},
			delay: null,
			loop: null,
			hidden: false
		}
	],
	//Flux.next('interface', 'hardware', 'runtime', null, null, null, true);
	lifeCycle: null,
	interactive: null,
	clock: null
};

if (Odi.isAwake()) {
	setLifeCycleJobs();
	initClock();
	setInteractiveJobs();
}

new CronJob(
	'*/30 * * * * *',
	function() {
		Flux.next('interface', 'hardware', 'runtime', null, null, null, true);
	},
	null,
	true,
	'Europe/Paris'
);
new CronJob(
	'1 * * * * *',
	function() {
		Flux.next('service', 'time', 'isAlarm', null, null, null, true);
	},
	null,
	true,
	'Europe/Paris'
);

new CronJob(
	'0 2 0 * * 1',
	function() {
		Flux.next('interface', 'hardware', 'archiveLog');
	},
	null,
	true,
	'Europe/Paris'
);

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
	new CronJob(
		'0 18,20,22-25 8 * * 1-5',
		function() {
			Flux.next('service', 'interaction', 'goToWork');
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
		'10 */20 * * * *',
		function() {
			log.info('night callback');
			log.INFO('----------> night callback to activate !! <----------');
			//Flux.next('service', 'interaction', 'nightCallback');
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'0 19 19 * * *',
		function() {
			Flux.next('interface', 'tts', 'speak', "Je crois qu'il faut lancer l'opairation baluchon");
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'13 13,25,40,51 17-21 * * *',
		function() {
			Flux.next('service', 'interaction', 'random');
		},
		null,
		true,
		'Europe/Paris'
	);
	log.info('Interactive jobs initialised');
}

/** Function to random TTS ggood night. NOT EXPORTED! */
function goToSleep() {
	// TODO move this function to a service/interface
	let sleepTTS = Utils.randomItem(Odi.ttsMessages.goToSleep);
	Flux.next('interface', 'tts', 'speak', sleepTTS);
	log.info('AutoLifeCycle go to sleep !');
	setTimeout(function() {
		Flux.next('service', 'system', 'restart', 'sleep');
	}, sleepTTS.msg.length * 150);
}

/** Function to set background tasks */
function setLifeCycleJobs() {
	// Auto Sleep
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

	// Restart & Reboot
	new CronJob(
		'13 13 13 * * 1-6',
		function() {
			Flux.next('interface', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Auto restart' }); // Daily restart Odi's core
			Flux.next('service', 'system', 'restart', null, 3);
		},
		null,
		true,
		'Europe/Paris'
	);
	new CronJob(
		'13 13 13 * * 0',
		function() {
			Flux.next('interface', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Reset config' }); // Weekly RPI reboot
			log.info('resetCfg'); // Weekly reset of conf
			Flux.next('interface', 'runtime', 'reset', true, 3);
		},
		null,
		true,
		'Europe/Paris'
	);
	new CronJob(
		'15 15 13 * * 0',
		function() {
			Flux.next('interface', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Auto reboot' }); // Weekly RPI reboot
			Flux.next('service', 'system', 'reboot', null, 3);
		},
		null,
		true,
		'Europe/Paris'
	);
	log.info('Life cycle jobs initialised');
}
