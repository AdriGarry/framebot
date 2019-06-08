#!/usr/bin/env node

'use strict';

const request = require('request');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	SMS_CREDENTIALS = require(Core._SECURITY + 'credentials.json').sms;

Core.flux.service.sms.subscribe({
	next: flux => {
		if (flux.id == 'send') {
			sendSMS(flux.value);
		} else Core.error('unmapped flux in SMS service', flux);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function sendSMS(message) {
	request.post(
		{
			url: SMS_CREDENTIALS.url,
			headers: {
				'Content-Type': 'application/json'
			},
			json: true,
			body: {
				user: SMS_CREDENTIALS.user,
				pass: SMS_CREDENTIALS.pass,
				msg: message
			}
		},
		sendSMSCallback
	);
}

function sendSMSCallback(error, response, body) {
	if (!error && response.statusCode == 200) {
		log.debug('SMS notification successfully send');
	} else {
		console.log('-->', response, error);
		let errorLog = 'SMS notification failure. Error code: ' + response.statusCode;
		if (response.statusCode === 400) {
			errorLog += ' missing parameter.';
		} else if (response.statusCode === 402) {
			errorLog += ' too much SMS sent !';
		} else if (response.statusCode === 403) {
			errorLog += ' wrong credential or inactive service.';
		} else if (response.statusCode === 500) {
			errorLog += ' SMS API server error. Try again later.';
		}
		log.error(errorLog);
	}
}
