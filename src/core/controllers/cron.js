#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

Core.flux.controller.cron.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			startJobs(flux.value);
		} else Core.error('unmapped flux in Cron controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function startJobs(jobList) {
	if (!Array.isArray(jobList)) jobList = [jobList];
	if (jobList.length) {
		jobList.forEach(job => {
			scheduleJob(job);
		});
		log.info('Cron loaded [' + Utils.executionTime(Core.startTime) + 'ms]');
	} else {
		Core.error('Wrong jobList:', jobList);
	}
}

function scheduleJob(job) {
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
	if (job.log) log.info(job.log);
}
