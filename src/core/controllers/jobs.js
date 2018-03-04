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
	// TODO try catch block
	new CronJob(
		job.cron,
		function() {
			Flux.next(job.flux.id, job.flux.data, job.flux.conf);
			// Object.keys(job.flux).forEach(key => {
			// 	let fluxVal = job.flux[key];
			// 	// Flux.next(fluxId[0], fluxId[1], fluxId[2], fluxVal.value, fluxVal.delay, fluxVal.loop, fluxVal.hidden);
			// 	Flux.next(flux.id, flux.data, flux.conf);
			// });
		},
		null,
		true,
		'Europe/Paris'
	);
	Object.keys(job.flux).forEach(key => {
		jobLog += ' _' + key;
	});

	log.debug('new job: [' + job.cron + '] ' + jobLog);
}

function scheduleJobs(jobsList, jobsType) {
	jobsList.forEach(job => {
		scheduleJob(job);
	});
	log.info(jobsType + ' jobs initialised');
}

scheduleJobs(JOBS.system, 'System');
scheduleJobs(JOBS.lifeCycle, 'Life cycle');

if (Odi.isAwake()) {
	scheduleJobs(JOBS.clock, 'Clock');
	scheduleJobs(JOBS.interactive, 'Interactive');
}
