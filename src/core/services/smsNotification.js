#!/usr/bin/env node

'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new(require(Core._CORE + 'Logger.js'))(__filename);
const request = require('request');

const SMS_CREDENTIALS = require(Core._SECURITY + 'smsCredentials.json');

Core.flux.service.smsNotification.subscribe({
	next: flux => {
		if (flux.id == 'sendSMS') {
			sendSMS(flux.value);
		} else if (flux.id == 'sendError') {
			sendErrorNotification(flux.value);
		} else Core.error('unmapped flux in SMS Notification service', flux, false);
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
	request.post({
			url: SMS_CREDENTIALS.url,
			form: {
				user: SMS_CREDENTIALS.user,
				pass: SMS_CREDENTIALS.pass,
				msg: encodedMessage
			}
		},
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				log.debug('SMS notification successfully send');
			} else {
				log.error('SMS notification send fail. Error code: ' + response.statusCode);
				// gérer le code de retour :
				// 200 : Le SMS a été envoyé sur votre mobile.
				// 400 : Un des paramètres obligatoires est manquant.
				// 402 : Trop de SMS ont été envoyés en trop peu de temps.
				// 403 : Le service n'est pas activé sur l'espace abonné, ou login / clé incorrect.
				// 500 : Erreur côté serveur. Veuillez réessayer ultérieurement.
			}
		}
	);
}