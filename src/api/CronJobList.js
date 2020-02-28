#!/usr/bin/env node

'use strict';

const CronJob = require('cron').CronJob;

const log = new (require('./Logger.js'))(__filename);

let Flux;

const DEFAULT_ID = '#';

module.exports = class CronJobList {
	constructor(jobList, id, cronDisplay) {
		this.id = id || DEFAULT_ID;
		this.jobList = buildJobList(jobList);
		this.length = jobList.length;
		this.crons = cronDisplay ? chainCrons(jobList) : '';
	}

	start() {
		log.info(`Starting ${this.toString()}`);
		this.jobList.forEach(job => {
			job.start();
		});
	}

	stop() {
		log.info(`Stopping ${this.toString()}`);
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

	toString() {
		return `CronJobList ${this.id}[${this.length}] ${this.crons}`;
	}
};

function buildJobList(jobList) {
	if (!Flux) Flux = require('./Flux.js');
	let jobs = [];
	jobList.forEach(job => {
		jobs.push(
			new CronJob(job.cron, () => {
				new Flux(job.flux);
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
