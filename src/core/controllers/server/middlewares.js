#!/usr/bin/env node

// Middleware sub-module (server)

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
const Flux = require(Odi._CORE + 'Flux.js');
const Utils = require(ODI_PATH + 'src/core/Utils.js');
const fs = require('fs');

const FILE_REQUEST_HISTORY = ODI_PATH + 'log/requestHistory.log';
const noSoundUrl = ['/dashboard', '/log'];

module.exports = {
	getMiddlewares1: getMiddlewares1,
	getMiddlewares: getMiddlewares
};

var unauthorizedRequestNb = 0,
	tooMuchBadRequests = false;

function getMiddlewares(ui) {
	// ui.use(security);
	// ui.use(logger);
	// return ui;
	return [security, logger];
}
function getMiddlewares1(ui) {
	// ui.use(security);
	// ui.use(logger);
	// return ui;
	return middleware;
}

var security = function(req, res, next) {
	console.log('AAA');
	let requestToLog;
	res.header('Access-Control-Allow-Origin', 'http://adrigarry.com');

	Flux.next('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { hidden: true });

	if (!Utils.searchStringInArray(req.url, noSoundUrl)) Flux.next('interface|sound|UI', null, { hidden: true });

	if (!req.connection.remoteAddress) {
		log.error('Incoming socket /!\\ /!\\');
		log.info(req.connection); // TODO revoir cette sécurité...
	} else if (req.connection.remoteAddress.indexOf('192.168') == -1) {
		// Logging not local requests
		// console.log('________ A request:', request, ' ++ req.url:', req.url);
		requestToLog = Utils.logTime('D/M h:m:s ') + req.url + ' [' + req.connection.remoteAddress + ']\r\n';
		console.log('________ B  ', req.url);
		fs.appendFile(FILE_REQUEST_HISTORY, requestToLog, function(err) {
			if (err) return Odi.error(err);
		});
	}
};

var logger = function(req, res, next) {
	console.log('BBB');
	let ip = req.connection.remoteAddress.indexOf('192.168') > -1 ? '' : 'from [' + req.connection.remoteAddress + ']';

	if (req.headers['user-interface'] === 'UIv5') {
		// Allowed requests
		requestToLog = req.headers['user-interface'] + ' ' + req.url.replace('%20', ' ');
		log.info(requestToLog, ip);
		res.statusCode = 200;
		next();
	} else if (req.url == '/favicon.ico') {
		log.info('favicon request', req.url, ip);
		res.status(401); // Unauthorized
		res.end();
	} else {
		if (unauthorizedRequestNb >= 5) {
			tooMuchBadRequests = true;
			// closingServerTemporary();
			var badRequestTimeout = setTimeout(function() {
				clearTimeout(badRequestTimeout);
				tooMuchBadRequests = false;
				unauthorizedRequestNb = 0;
			}, 10000);
		}
		unauthorizedRequestNb++;

		if (!tooMuchBadRequests) {
			if (Odi.isAwake()) {
				Flux.next(
					'interface|tts|speak',
					{ voice: 'espeak', lg: 'en', msg: 'Bad request' },
					{ delay: 0.5, hidden: true }
				);
			}
		}

		// Not allowed requests
		request = '401 ' + req.url.replace('%20', ' ');
		Odi.error('Bad request', request + ' ' + ip, false);
		res.status(401); // Unauthorized
		res.end();
	}
};

var middleware = function(req, res, next) {
	let requestToLog;
	res.header('Access-Control-Allow-Origin', 'http://adrigarry.com');

	Flux.next('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { hidden: true });

	if (!Utils.searchStringInArray(req.url, noSoundUrl)) Flux.next('interface|sound|UI', null, { hidden: true });

	if (!req.connection.remoteAddress) {
		log.error('Incoming socket /!\\ /!\\');
		log.info(req.connection); // TODO revoir cette sécurité...
	} else if (req.connection.remoteAddress.indexOf('192.168') == -1) {
		// Logging not local requests
		// console.log('________ A request:', request, ' ++ req.url:', req.url);
		requestToLog = Utils.logTime('D/M h:m:s ') + req.url + ' [' + req.connection.remoteAddress + ']\r\n';
		console.log('________ B  ', req.url);
		fs.appendFile(FILE_REQUEST_HISTORY, requestToLog, function(err) {
			if (err) return Odi.error(err);
		});
	}

	let ip = req.connection.remoteAddress.indexOf('192.168') > -1 ? '' : 'from [' + req.connection.remoteAddress + ']';

	if (req.headers['user-interface'] === 'UIv5') {
		// Allowed requests
		requestToLog = req.headers['user-interface'] + ' ' + req.url.replace('%20', ' ');
		log.info(requestToLog, ip);
		res.statusCode = 200;
		next();
	} else if (req.url == '/favicon.ico') {
		log.info('favicon request', req.url, ip);
		res.status(401); // Unauthorized
		res.end();
	} else {
		if (unauthorizedRequestNb >= 5) {
			tooMuchBadRequests = true;
			// closingServerTemporary();
			var badRequestTimeout = setTimeout(function() {
				clearTimeout(badRequestTimeout);
				tooMuchBadRequests = false;
				unauthorizedRequestNb = 0;
			}, 10000);
		}
		unauthorizedRequestNb++;

		if (!tooMuchBadRequests) {
			if (Odi.isAwake()) {
				Flux.next(
					'interface|tts|speak',
					{ voice: 'espeak', lg: 'en', msg: 'Bad request' },
					{ delay: 0.5, hidden: true }
				);
			}
		}

		// Not allowed requests
		request = '401 ' + req.url.replace('%20', ' ');
		Odi.error('Bad request', request + ' ' + ip, false);
		res.status(401); // Unauthorized
		res.end();
	}
};

function closingServerTemporary() {
	// Deprecated ?
	log.INFO('closing UI server temporary.');
	ui.close;
	setTimeout(function() {
		log.info('restarting UI server...');
		startUIServer();
	}, 3000);
}
