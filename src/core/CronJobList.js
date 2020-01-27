#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

module.exports = CronJobList;

function CronJobList(jobList, id) {
	this.id = id;
	this.jobList = setJobList(jobList);
	this.start = function() {
		this.jobList.forEach(job => {
			job.start();
		});
	};
	this.stop = function() {
		this.jobList.forEach(job => {
			job.stop();
		});
	};

	function setJobList(jobList) {
		let jobs = [];
		jobList.forEach(job => {
			jobs.push(
				new CronJob(
					job.cron,
					function() {
						Core.do(job.flux);
					},
					null,
					true,
					'Europe/Paris'
				)
			);
		});
		return jobs;
	}
}
