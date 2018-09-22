#!/usr/bin/env node

'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const request = require('request');

const SMS_CREDENTIALS = require(Core._SECURITY + 'smsCredentials.json');

Core.flux.service.sms.subscribe({
	next: flux => {
		if (flux.id == 'sendSMS') {
			sendSMS(flux.value);
		} else if (flux.id == 'sendError') {
			sendErrorNotification(flux.value);
		} else Core.error('unmapped flux in SMS service', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

const ERROR_MESSAGE = Core.Name + ' error: ';

function sendErrorNotification(error) {
	sendSMS(ERROR_MESSAGE + error);
}

function sendSMS(message) {
	let encodedMessage = encodeURI(message);
	console.log(SMS_CREDENTIALS);
	// request(
	// 	{
	// 		url: SMS_CREDENTIALS.url,
	// 		method: 'POST',
	// 		headers: {
	// 			'User-Agent': 'Super Agent/0.0.1',
	// 			'Content-Type': 'application/x-www-form-urlencoded'
	// 		},
	// 		form: {
	// 			user: SMS_CREDENTIALS.user,
	// 			pass: SMS_CREDENTIALS.pass,
	// 			msg: message
	// 		}
	// 	},
	// 	sendSMSCallback
	// );
	request.get(
		SMS_CREDENTIALS.url + '?user=' + SMS_CREDENTIALS.user + '&pass=' + SMS_CREDENTIALS.pass + '&msg=' + encodedMessage,
		sendSMSCallback
	);
}

function sendSMSCallback(error, response, body) {
	if (!error && response.statusCode == 200) {
		log.debug('SMS notification successfully send');
	} else {
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
