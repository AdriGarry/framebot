#!/usr/bin/env node

// Middleware sub-module (server)

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
const Flux = require(Odi._CORE + 'Flux.js');
const Utils = require(ODI_PATH + 'src/core/Utils.js');
const fs = require('fs');

const FILE_REQUEST_HISTORY = ODI_PATH + 'log/requestHistory.log';
const noSoundUrl = ['/dashboard', '/log'];
const BAD_REQUEST_TIMEOUT = 5000;
const BAD_REQUEST_CP_LIMIT = 5;
var badRequestCount = 0;
var canTTSBadRequest = true;

module.exports = {
	security: function() {
		return securityMiddleware;
	}
};

var securityMiddleware = function(req, res, next) {
	Flux.next('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { hidden: true });
	if (!Utils.searchStringInArray(req.url, noSoundUrl)) Flux.next('interface|sound|UI', null, { hidden: true });

	let requestData = getRequestData(req);

	if (!requestData.ip) {
		if (req.isSocket) {
			log.INFO('..............This is a socket (search: "req.isSocket")!!');
		} else {
			log.INFO('..............This is NOT a socket (search: "req.isSocket")!!');
		}
		log.error('Incoming socket /!\\ /!\\');
		log.info(req); // TODO revoir cette sécurité...
		rejectUnauthorizedRequest(res);
	}

	if (requestData.ui !== 'UIv5') {
		// Not allowed requests
		if (canTTSBadRequest && Odi.isAwake()) {
			canTTSBadRequest = false;
			Flux.next('interface|tts|speak', { voice: 'espeak', lg: 'en', msg: 'Bad request' }, { delay: 0.5, hidden: true });
			setTimeout(() => {
				canTTSBadRequest = true;
			}, BAD_REQUEST_TIMEOUT);
		}
		Odi.error('Bad request', '401 ' + decodeURI(req.url) + ' ' + requestData.log, false);
		rejectUnauthorizedRequest(res);
	}

	if (!requestData.isLocalIp) {
		logNotLocalRequest(req);
	}
	log.info(requestData.ui + ' ' + decodeURI(req.url), requestData.log);
	res.statusCode = 200;
	next();
};

function getRequestData(req) {
	let position,
		requestData = {}; // { ip, isLocalIp, position, log }

	requestData.ip = req.connection.remoteAddress;
	requestData.isLocalIp = requestData.ip.indexOf('192.168') > -1;

	try {
		position = JSON.parse(req.headers['user-position']);
		if (position && typeof position == 'object') {
			requestData.position = {}; //{ latitude: 0, longitude: 0 };
			requestData.position.latitude = position.latitude;
			requestData.position.longitude = position.longitude;
		}
	} catch (err) {
		log.debug('position not retrieved!', position);
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

function logNotLocalRequest(req) {
	let requestToLog = Utils.logTime('D/M h:m:s ') + req.url + ' [' + req.connection.remoteAddress + ']\r\n';
	fs.appendFile(FILE_REQUEST_HISTORY, requestToLog, function(err) {
		if (err) return Odi.error(err);
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
	Flux.next('controller|server|closeUIServer', breakDuration);
	setTimeout(function() {
		log.INFO('restarting UI server...');
		badRequestCount = 0;
		Flux.next('controller|server|startUIServer');
	}, breakDuration);
}
