#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename);

class CronJobList {
	constructor(jobList, id) {
		this.id = id || 'noCronJobListId';
		this.jobList = buildJobList(jobList);
		this.crons = chainCrons(jobList);
	}

	start() {
		log.info(`Starting job list ${this.id} ${this.crons}`);
		this.jobList.forEach(job => {
			job.start();
		});
	}

	stop() {
		log.info(`Stopping job list ${this.id} ${this.crons}`);
		this.jobList.forEach(job => {
			job.stop();
		});
	}

	nextDate() {
		let nextDate;
		this.jobList.forEach(job => {
			let date = new Date(job.nextDate()).toLocaleString();
			if (!nextDate || nextDate > date) nextDate = date;
		});
		return nextDate;
	}
}
module.exports = CronJobList;

function buildJobList(jobList) {
	let jobs = [];
	jobList.forEach(job => {
		jobs.push(
			new CronJob(job.cron, () => {
				Core.do(job.flux);
			})
		);
	});
	return jobs;
}

function chainCrons(jobList) {
	let crons = '';
	jobList.forEach(job => {
		crons += '[' + job.cron + '] ';
	});
	return crons;
}
