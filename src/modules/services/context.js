#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

module.exports = {
	cron: {
		full: [
			{ cron: '5 0 0 * * 1-5', flux: { id: 'service|context|goToSleep' } },
			{ cron: '5 0 2 * * 0,6', flux: { id: 'service|context|goToSleep' } },
			{
				cron: '13 13 13 * * 1-6',
				flux: [
					{ id: 'interface|tts|speak', data: { lg: 'en', msg: 'Auto restart' } },
					{ id: 'service|context|restart', conf: { delay: 3 } }
				]
			},
			{
				cron: '13 13 13 * * 0',
				flux: [
					{ id: 'interface|tts|speak', data: { lg: 'en', msg: 'Reset config' } },
					{ id: 'service|context|reset', conf: { delay: 3 } }
				]
			}
		]
	}
};

Core.flux.service.context.subscribe({
	next: flux => {
		if (flux.id == 'restart') {
			restartCore(flux.value);
		} else if (flux.id == 'sleep') {
			restartCore('sleep');
		} else if (flux.id == 'sleepForever') {
			updateConf({ mode: 'sleep', alarms: { weekDay: null, weekEnd: null } }, true);
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else if (flux.id == 'update') {
			updateConf(flux.value, false);
		} else if (flux.id == 'updateRestart') {
			updateConf(flux.value, true);
		} else if (flux.id == 'reset') {
			resetCore();
		} else Core.error('unmapped flux in Context service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

/** Function to restart/sleep Core */
function restartCore(mode) {
	log.info('restarting Core...', mode);
	if (typeof mode !== 'string') mode = 'ready';
	if (Core.run('timer')) {
		let timerRemaining = 'Minuterie ' + Core.run('timer') + 'secondes';
		Core.do('interface|tts|speak', timerRemaining);
		log.INFO(timerRemaining);
	}
	setTimeout(() => {
		Core.do('service|context|updateRestart', { mode: mode });
	}, 100);
}

/** Function to random TTS good night, and sleep */
function goToSleep() {
	if (Core.isAwake()) {
		let sleepTTS = Utils.randomItem(Core.ttsMessages.goToSleep);
		Core.do('interface|tts|speak', sleepTTS);
		log.info('AutoLifeCycle go to sleep !');
		setTimeout(function() {
			Core.do('service|context|restart', 'sleep');
		}, sleepTTS.msg.length * 150);
	}
}

/** Function to set/edit Core's config SYNC */
function updateConf(newConf, restart) {
	let updateBegin = new Date();
	let updatedEntries = [];
	Object.keys(newConf).forEach(key => {
		updatedEntries.push(key);
		Core.conf(key, newConf[key], restart, true);
	});
	let header = 'CONFIG UPDATE' + ' '.repeat(5) + Utils.executionTime(updateBegin) + 'ms';
	log.table(Core.conf(), header, updatedEntries);
	if (restart) {
		setTimeout(() => {
			processExit();
		}, 1000);
	}
}

/** Function to reset Core (/tmp/ directory) */
function resetCore() {
	Core.do('interface|sound|reset');
	Utils.deleteFolderRecursive(Core._TMP);
	log.INFO('reset conf and restart');
	log.info('buttonStats:', Core.run().buttonStats);
	log.info('exit.');
	setTimeout(function() {
		processExit();
	}, 500);
}

const EXIT_LOG_ARRAY = ['bye!', 'see ya!', 'hope to see u soon!'];
function processExit() {
	Core.do('service|tasks|beforeRestart');
	log.info('buttonStats:', Core.run().buttonStats);
	log.info('fluxCount:', Core.run('stats.fluxCount'));
	log.info('exit program,', EXIT_LOG_ARRAY[Utils.rdm(3)]);
	process.exit();
}
