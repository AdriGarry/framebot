#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

Core.flux.controller.cron.subscribe({
	next: flux => {
		if (flux.id == 'add') {
			addJob(flux.value);
		} else Core.error('unmapped flux in Cron controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	scheduleJobs(Core.default.cron.base, 'base default');
	scheduleJobs(Core.descriptor.cron.base, 'base descriptor');
	if (Core.isAwake()) {
		scheduleJobs(Core.default.cron.full, 'full default');
		scheduleJobs(Core.descriptor.cron.full, 'full descriptor');
	}
});

function addJob(jobs) {
	log.debug('addJob', jobs);
	if (!Array.isArray(jobs)) jobs = [jobs];
	scheduleJobs(jobs);
}
function scheduleJob(job) {
	log.debug('scheduleJob(job)', job);
	let jobLog = '';
	new CronJob(
		job.cron,
		function() {
			Core.do(job.flux);
		},
		null,
		true,
		'Europe/Paris'
	);
	if (Array.isArray(job.flux)) {
		Object.keys(job.flux).forEach(key => {
			jobLog += '_' + job.flux[key].id;
		});
	} else {
		jobLog += '_' + job.flux.id;
	}

	log.debug('new cron job: [' + job.cron + '] ' + jobLog);
}

const EVAL_REGEX = new RegExp(/^eval:(\w+.\w+.\w+.)/);
//eval:Core.run.etat // ^eval:\w+.\w+.\w+.
function scheduleJobs(jobList, jobType) {
	if (jobList.length) {
		jobList.forEach(job => {
			// if (typeof job.data == 'string') {
			// 	let temp = EVAL_REGEX.match(job.data);
			// if (temp) {
			// log.INFO('====> EVALUATE JOBS DATA...');
			let toto = job.data && findByVal(job.data, EVAL_REGEX);
			if (toto) {
				log.warn('.... ok on peut parser cette valeur:', toto);
			}
			// 	}
			// }
			scheduleJob(job);
			// log.info('job', job);
			if (!jobType) log.info(jobType || job.log || job.flux.id, 'cron job initialised');
		});
		if (jobType) log.info(jobType, 'cron jobs initialised');
	}
}

// DEPRECATED ?
function findByKey(object, key) {
	// TODO move to Utils.js
	let value = false;
	Object.keys(object).some(k => {
		if (k == key) {
			return object[k];
		} else if (key.constructor == RegExp) {
			if (key.test(k)) {
				return object[k];
			}
		}
		if (object[k] && typeof object[k] === 'object') {
			return undefined !== findByKey(object[k], key);
		}
	});
	return value;
}

function findByVal(object, val) {
	// TODO move to Utils.js
	console.log(val);
	let value = false;
	Object.keys(object).some(k => {
		if (object[k] == val) {
			return object[k];
		} else if (val.constructor == RegExp) {
			if (val.test(object[k])) {
				return object[k];
			}
		}
		if (object[k] && typeof object[k] === 'object') {
			return undefined !== findByVal(object[k], key);
		}
	});
	return value;
}
