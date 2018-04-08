#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var CronJob = require('cron').CronJob;

var Flux = require(Odi._CORE + 'Flux.js');

const JOBS = require(Odi._DATA + 'jobList.json');

scheduleJobs(JOBS.system, 'System');
if (Odi.isAwake()) {
	scheduleJobs(JOBS.cycle, 'Cycle');
	scheduleJobs(JOBS.interactive, 'Interactive');
}

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
		Object.keys(job.flux).forEach(key => {
			jobLog += '_' + job.flux[key].id;
		});
	} else {
		jobLog += '_' + job.flux.id;
	}

	log.debug('new job: [' + job.cron + '] ' + jobLog);
}

const EVAL_REGEX = new RegExp(/^eval:(\w+.\w+.\w+.)/);
//eval:Odi.run.etat // ^eval:\w+.\w+.\w+.
function scheduleJobs(jobsList, jobsType) {
	jobsList.forEach(job => {
		// if (typeof job.data == 'string') {
		// 	let temp = EVAL_REGEX.match(job.data);
		// if (temp) {
		// log.INFO('====> EVALUATE JOBS DATA...');
		let toto = job.data && findByVal(job.data, EVAL_REGEX);
		if (toto) {
			log.INFO('.... ok on peut parser cette valeur:', toto);
		}
		// 	}
		// }
		scheduleJob(job);
	});
	log.info(jobsType + ' jobs initialised');
}

function findByKey(object, key) {
	// TODO move to Utils.js
	let value = false;
	Object.keys(object).some(function(k) {
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
	Object.keys(object).some(function(k) {
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
