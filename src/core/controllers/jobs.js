#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var CronJob = require('cron').CronJob;

var date = new Date();
var hour = date.getHours();
var pastHour = hour;

const Rx = require('rxjs');
var Jobs = new Rx.Subject();

// module.exports = Jobs;

////////// TESTS //////////

var Flux = require(Odi._CORE + 'Flux.js');

new CronJob(
	'*/6 * * * * *',
	function() {
		// Jobs.next({ id: "clock", value: "*/6", delay: "1.8" });
	},
	null,
	false,
	'Europe/Paris'
);
new CronJob(
	'*/7 * * * * *',
	function() {
		// Jobs.next({ id: "toto", value: "hey" });
		// Jobs.next({ id: "toto", value: "_SALUT !!", delay: 2.5 });
	},
	null,
	false,
	'Europe/Paris'
);

////////// TESTS //////////

/** Function to init clock  */
function initClock() {
	if (true) {
		// Mode work // --> get test value from
		// new CronJob('0 0,30 8-23 * * 1-5', function(){
		new CronJob(
			'*/15 * * * * *',
			function() {
				// ODI.time.now();
				Jobs.next({ id: 'clock', value: '*/10' });
			},
			null,
			true,
			'Europe/Paris'
		);
		// new CronJob('0 0,30 12-23 * * 0,7', function(){
		new CronJob(
			'*/6 * * * * *',
			function() {
				// ODI.time.now();
				Jobs.next({ id: 'toto', value: 'salut!' });
				Jobs.next({ id: 'toto', value: 'salut!', delay: 1.5 });
			},
			null,
			true,
			'Europe/Paris'
		);
		console.log('Clock jobs initialised in regular mode');
	} else {
		// Mode any time
		new CronJob(
			'0 0,30 * * * *',
			function() {
				// ODI.time.now();
				Jobs.next({ id: 'time', value: 'now' });
			},
			null,
			true,
			'Europe/Paris'
		);
		console.log('Clock jobs initialised in any time mode !');
	}
}

/** Function to set alarms */
function setInteractiveJobs() {
	// WEEKDAY
	new CronJob(
		'0 20,22-25 8 * * 1-5',
		function() {
			if (Math.floor(Math.random() * 2)) ODI.tts.speak({ lg: 'fr', voice: 'espeak', msg: 'Go go go, allez au boulot' });
			else ODI.tts.speak({ lg: 'fr', voice: 'espeak', msg: 'Allez allez, Maitro boulot dodo' });
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'0 30 18 * * 1-5',
		function() {
			ODI.utils.testConnexion(function(connexion) {
				setTimeout(function() {
					if (connexion == true) {
						ODI.jukebox.playFip();
					} else {
						ODI.jukebox.loop();
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
			console.log('Il est 13 heures et tout va bien !');
			spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', '13Heures']);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'13 13,25,40,51 17-22 * * *',
		function() {
			ODI.service.randomAction();
		},
		null,
		true,
		'Europe/Paris'
	);
	console.log('Interactive jobs initialised');
}

/** Function to set auto sleep life cycles */
function setAutoSleep() {
	new CronJob(
		'3 0 0 * * 1-5',
		function() {
			goToSleep();
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'3 0 2 * * 0,6',
		function() {
			goToSleep();
		},
		null,
		true,
		'Europe/Paris'
	);
	console.log('Auto Sleep Life Cycle jobs initialised');
}

/** Function to random TTS ggood night. NOT EXPORTED! */
function goToSleep() {
	var rdmSleepTTS = Math.floor(Math.random() * ODI.ttsMessages.goToSleep.length);
	var sleepTTS = ODI.ttsMessages.goToSleep[rdmSleepTTS];
	ODI.tts.speak(sleepTTS);
	console.log('AutoLifeCycle go to sleep !');
	setTimeout(function() {
		ODI.hardware.restartOdi(255);
	}, sleepTTS.msg.length * 150);
}

/** Function to set background tasks */
function setBackgroundJobs() {
	new CronJob(
		'13 13 13 * * 1-6',
		function() {
			ODI.tts.speak({ voice: 'espeak', lg: 'en', msg: 'Auto restart' }); // Daily restart Odi's core
			setTimeout(function() {
				// ODI.hardware.restartOdi();
			}, 3000);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'13 13 13 * * 0',
		function() {
			ODI.tts.speak({ voice: 'espeak', lg: 'en', msg: 'Reset config' }); // Weekly RPI reboot
			setTimeout(function() {
				// ODI.config.resetCfg();
			}, 3000);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'15 15 13 * * 0',
		function() {
			ODI.tts.speak({ voice: 'espeak', lg: 'en', msg: 'Auto reboot' }); // Weekly RPI reboot
			setTimeout(function() {
				// ODI.hardware.reboot();
			}, 3000);
		},
		null,
		true,
		'Europe/Paris'
	);

	new CronJob(
		'0 0 5 * * 1',
		function() {
			console.log('Clean log files  /!\\'); // Weekly cleaning of logs
			// ODI.hardware.cleanLog();
		},
		null,
		true,
		'Europe/Paris'
	);
}
