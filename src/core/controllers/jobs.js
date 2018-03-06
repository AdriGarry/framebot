#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var CronJob = require('cron').CronJob;

var Flux = require(Odi._CORE + 'Flux.js');

const JOBS = require(Odi._DATA + 'jobsLibrary.json');

function scheduleJob(job) {
	let jobLog = '';
	new CronJob(
		job.cron,
		function() {
			Flux.next(job.flux);
		},
		null,
		true,
		'Europe/Paris'
	);
	if (Array.isArray(job.flux)) {
		jobLog += ' _' + job.flux.id;
	} else {
		Object.keys(job.flux).forEach(key => {
			jobLog += ' _' + job.flux[key].id;
		});
	}

	log.debug('new job: [' + job.cron + '] ' + jobLog);
}

function scheduleJobs(jobsList, jobsType) {
	jobsList.forEach(job => {
		scheduleJob(job);
	});
	log.info(jobsType + ' jobs initialised');
}

scheduleJobs(JOBS.system, 'System');
if (Odi.isAwake()) {
	scheduleJobs(JOBS.interactive, 'Interactive');
}
