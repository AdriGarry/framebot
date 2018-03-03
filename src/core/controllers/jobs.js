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

const JOBS = require(Odi._DATA + 'jobs.json');

function scheduleJob(job) {
	let jobLog = '';
	new CronJob(
		job.when,
		function() {
			Object.keys(job.todo).forEach(key => {
				let fluxVal = job.todo[key];
				let flux = key.split('|');
				Flux.next(flux[0], flux[1], flux[2], fluxVal.value, fluxVal.delay, fluxVal.loop, fluxVal.hidden);
			});
		},
		null,
		true,
		'Europe/Paris'
	);
	Object.keys(job.todo).forEach((key, index) => {
		jobLog += ' _' + key;
	});

	log.info('new job: [' + job.when + '] ' + jobLog);
}

function scheduleJobs(jobsList) {
	log.info('scheduleJobs...');
}

if (Odi.isAwake()) {
	scheduleJob(JOBS.interactive[0]);
}
