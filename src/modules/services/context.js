#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

module.exports = {
	api: {
		base: { POST: [{ url: 'reset', flux: { id: 'service|context|reset', conf: { delay: 1 } } }] },
		full: {
			POST: [
				{ url: 'odi', flux: { id: 'service|context|restart', conf: { delay: 0.1 } } },
				{ url: 'sleep', flux: { id: 'service|context|restart', data: 'sleep', conf: { delay: 0.1 } } },
				{
					url: 'sleep/forever',
					flux: {
						id: 'service|context|updateRestart',
						data: { mode: 'sleep', alarms: { weekDay: null, weekEnd: null } },
						conf: { delay: 0.1 }
					}
				},
				{
					url: 'testSequence',
					flux: { id: 'service|context|updateRestart', data: { mode: 'test' }, conf: { delay: 1 } }
				}
			]
		}
	},
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
		} else if (flux.id == 'goToSleep') {
			goToSleep();
		} else if (flux.id == 'update') {
			updateConf(flux.value, false);
		} else if (flux.id == 'updateRestart') {
			updateConf(flux.value, true);
		} else if (flux.id == 'reset') {
			resetCore();
		} else if (flux.id == 'refresh') {
			refreshRuntime();
		} else Core.error('unmapped flux in Context service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	refreshRuntime();
});

/** Function to restart/sleep Core */
function restartCore(mode) {
	log.info('restarting Core...', mode || '');
	if (Core.run('timer')) {
		let timerRemaining = 'Minuterie ' + Core.run('timer') + 'secondes';
		Core.do('interface|tts|speak', timerRemaining);
		log.INFO(timerRemaining);
	}
	Core.do('service|context|updateRestart', { mode: mode || 'ready' });
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
	let header = 'CONFIG UPDATE' + ' '.repeat(3) + Utils.executionTime(updateBegin, '    ') + 'ms';
	log.table(Core.conf(), header, updatedEntries);
	if (restart) {
		log.info('buttonStats:', Core.run().buttonStats);
		log.info('exit program.');
		process.exit();
	}
}

/** Function to reset Core (/tmp/ directory) */
function resetCore() {
	Core.do('interface|tts|speak', { lg: 'en', msg: 'reset config' });
	Core.do('interface|sound|reset');
	Utils.deleteFolderRecursive(Core._TMP);
	log.INFO('reset conf and restart');
	log.info('buttonStats:', Core.run().buttonStats);
	log.info('exit.');
	process.exit();
}

/** Function to refresh Core\'s runtime data (etat, timer, moods...) */
function refreshRuntime() {
	log.info("refreshing Core's runtime...");
	Core.do('interface|hardware|runtime', null, { log: 'trace' });
	setTimeout(function() {
		log.table(Core.run(), 'RUNTIME');
	}, 1000);
}
