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
		} else if (flux.id == 'stop') {
			stopJob(flux.value);
		} else Core.error('unmapped flux in Cron controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

var jobList = {};

function startJobs(jobList) {
	if (!Array.isArray(jobList)) jobList = [jobList];
	if (jobList.length) {
		jobList.forEach(job => {
			scheduleJob(job);
		});
		log.info(jobList.length + ' cron loaded');
	} else {
		Core.error('Wrong jobList:', jobList);
	}
}

function stopJob(jobId) {
	log.info('stopJob', jobId);
	if (jobList.hasOwnProperty(jobId)) {
		jobList[jobId].stop(); // TODO to test!!
	}
}

function scheduleJob(job) {
	let jobLog = '';
	let createdJob = new CronJob(
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
			jobLog += job.flux[key].id + ' ';
		});
	} else {
		jobLog += job.flux.id + ' ';
	}

	if (job.id) jobList[job.id] = createdJob;

	log.debug('new cron job: [' + job.cron + '] ' + jobLog);
	if (job.log) log.info(job.log);
}
