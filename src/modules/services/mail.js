'use strict';

const Email = require('email-templates');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {};

Core.flux.service.mail.subscribe({
	next: flux => {
		if (flux.id == 'send') {
			send(flux.value);
		} else Core.error('unmapped flux in Mail service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {});

function send(emailArg) {
	log.test(`send ${emailArg}`);
	log.test('send', emailArg);
	const email = new Email({
		message: {
			from: 'odi@adrigarry.com'
		},
		// uncomment below to send emails in development/test env:
		// send: true
		transport: {
			jsonTransport: true
		}
	});

	log.test(`send ${email}`);
	log.test('send', email);

	email
		.send({
			message: {
				to: 'adrigarry@gmail.com'
			},
			locals: {
				name: 'Odi'
			}
		})
		.then(console.log)
		.catch(console.error);
}
