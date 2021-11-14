#!/usr/bin/env node

const fs = require('fs');

const Core = require('./../../../core/Core').Core;

const { Flux, Logger, Utils } = require('./../../../api');

const log = new Logger(__filename);

const FILE_REQUEST_HISTORY = Core._LOG + Core.const('name') + '_requestHistory.log';
const NO_SOUND_URL = ['/dashboard', '/log'];
const BAD_REQUEST_TIMEOUT = 5000;
const BAD_REQUEST_CP_LIMIT = 5;

module.exports = {
	security: function () {
		return securityMiddleware;
	}
};

var securityMiddleware = function (req, res, next) {
	new Flux('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { log: 'trace' });

	let requestData = getRequestData(req);

	if (!requestData.ip) {
		if (req.isSocket) {
			log.INFO('This is a socket (search: "req.isSocket")!!');
		} else {
			log.INFO('This is NOT a socket (search: "req.isSocket")!!');
		}
		log.error('Incoming socket /!\\ /!\\');
		log.info(req);
		rejectUnauthorizedRequest(res);
	}

	if (!requestData.isLocalIp) {
		logNotLocalRequest(requestData);
	}

	// Not allowed requests
	if (requestData.ui !== 'UIv5') {
		if (Core.isAwake()) throttleBadRequestTTS();

		Core.run('stats.badRequestCount', Core.run('stats.badRequestCount') + 1);
		Core.error('Bad request', '401 ' + req.url + ' ' + requestData.log, false);
		rejectUnauthorizedRequest(res);
		return;
	}

	log.info(requestData.ui + ' ' + decodeURI(req.url), requestData.log);
	if (!Utils.searchStringInArray(req.url, NO_SOUND_URL)) new Flux('interface|sound|UI', null, { log: 'trace' });
	res.header('Content-Type', ' text/plain; charset=utf-8');
	res.statusCode = 200;
	next();
};

var throttleBadRequestTTS = Utils.throttle(badRequestTTS, BAD_REQUEST_TIMEOUT, true, false, this);

function badRequestTTS() {
	new Flux('interface|tts|speak', { voice: 'espeak', lg: 'en', msg: 'Bad request' }, { delay: 0.5, log: 'trace' });
}

function getRequestData(req) {
	let position,
		requestData = {}; // { ip, isLocalIp, position, log }

	requestData.url = req.url;
	requestData.ip = req.connection.remoteAddress;
	requestData.isLocalIp = requestData.ip.indexOf('192.168') > -1;

	try {
		position = JSON.parse(req.headers['user-position']);
		if (position && typeof position == 'object') {
			requestData.position = {};
			requestData.position.latitude = position.latitude;
			requestData.position.longitude = position.longitude;
		}
	} catch (err) {
		log.debug('position not retrieved!', position);
		// log.debug(err);
	}

	requestData.ui = req.headers['user-interface'];
	requestData.log = 'from [' + formatIp(requestData) + formatPosition(requestData) + ']';
	return requestData;
}

function formatIp(requestData) {
	return requestData.isLocalIp ? '' : requestData.ip;
}

function formatPosition(requestData) {
	let log = requestData.isLocalIp ? '' : '_';
	log += requestData.position
		? 'lat:' + requestData.position.latitude + '|lon:' + requestData.position.longitude
		: 'noPos';
	return log;
}

function logNotLocalRequest(requestData) {
	let requestToLog = Utils.logTime('D/M h:m:s ') + requestData.url + requestData.log + '\r\n';
	fs.appendFile(FILE_REQUEST_HISTORY, requestToLog, function (err) {
		if (err) return Core.error(err);
	});
}

function rejectUnauthorizedRequest(res) {
	res.status(401); // Unauthorized
	res.end();
	// badRequestCount++;
	// if (badRequestCount >= BAD_REQUEST_CP_LIMIT) {
	// 	closingServerTemporary(5000);
	// }
}

function closingServerTemporary(breakDuration) {
	new Flux('interface|server|closeUIServer', breakDuration);
	setTimeout(function () {
		log.INFO('restarting UI server...');
		badRequestCount = 0;
		new Flux('interface|server|startUIServer');
	}, breakDuration);
}
