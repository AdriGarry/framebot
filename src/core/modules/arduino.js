#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

Flux.module.arduino.subscribe({
	// TODO: ABSOLUMENT BLOQUER LES SONS EN MODE SLEEP !!
	next: flux => {
		if (flux.id == 'write') {
			write(flux.value);
		} else if (Odi.isAwake()) {
			if (flux.id == 'aa2') {
				//
			} else if (flux.id == 'aa3') {
				//
			} else {
				Odi.error('unmapped flux in Arduino module', flux, false);
			}
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

// BLINK SATELLITE WHEN RECEIVING DATA

/** Function to ... */
function write(msg) {
	log.debug('write()', msg);
	arduino.write(msg, function(err) {
		if (err) {
			console.log('Error: ', err.message);
		}
	});
}

// -- SerialPort --
// Chargement
const ARDUINO = '/dev/ttyACM0';

// var SerialPort = require('serialport');
// var arduino = new SerialPort(ARDUINO, { autoOpen: false });

// var serialport = require('serialport');
// var SerialPort = serialport.SerialPort;
// console.log(serialport.parsers);
// var arduino = new serialport(ARDUINO, { autoOpen: false /*, parser: serialport.parsers.readline('n')*/ });

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const arduino = new SerialPort(ARDUINO);
const feedback = arduino.pipe(new Readline({ delimiter: '\r\n' }));
/*arduino.open(function(err) {
	if (err) {
		Odi.error('Error opening arduino port: ', err);
		Flux.next('module', 'tts', 'speak', { lg: 'en', msg: "Can't connect to arduino" });
	} else {
		log.info('Communication serie Arduino opened [115200 bauds]');
	}
});*/
feedback.on('data', function(data) {
	log.info('Max>', data.trim());
});

// arduino.write('hi..');
log.info('Communication serie Arduino opened [115200 bauds]');

// var serialport = require('serialport');
// var SerialPort = serialport.SerialPort;
// console.log(serialport);
// console.log(serialport.parsers);

// var arduino = new SerialPort(ARDUINO, {
// 	baudrate: 9600,
// 	parser: serialport.parsers.readline('\n')
// });

// /************ IMPORTANT ********
// Pour fonctionner correctement, le fichier 'serialport' @ Users/node_modules/serialport/lib/serialport.js
// à été modifié à la ligne 32
// baudRate: 115200,
// La communication série dans les sketches arduino doit être paramètrés à 115200 bauds : Serial.begin(115200); */

// // Overture du port serie
// arduino.open(function(err) {
// 	if (err) {
// 		return console.log('Error opening port: ', err.message);
// 	} else {
// 		console.log('Communication serie Arduino 115200 bauds : Ok');
// 	}
// });

// arduino.on('data', function(data) {
// 	console.log(data);
// 	let buf = new Buffer(data);
// 	// io.sockets.emit('message', buf.toString('ascii'));
// 	console.log(buf.toString('ascii'));
// 	// console.log(buf.toString('utf8'));
// 	// console.log(buf);
// });

/*arduino.write(msg, function(err) {
	if (err) {
		return console.log('Error: ', err.message);
	}
});*/

/*var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

// Gestion des pages HTML
function sendError(errCode, errString, response) {
	response.writeHead(errCode, { 'Content-Type': 'text/plain' });
	response.write(errString + '\n');
	response.end();
	return;
}

function sendFile(err, file, response) {
	if (err) return sendError(500, err, response);
	response.writeHead(200);
	response.write(file, 'binary');
	response.end();
}

function getFile(exists, response, localpath) {
	if (!exists) return sendError(404, '404 Not Found', response);
	fs.readFile(localpath, 'binary', function(err, file) {
		sendFile(err, file, response);
	});
}

function getFilename(request, response) {
	var urlpath = url.parse(request.url).pathname;
	var localpath = path.join(process.cwd(), urlpath);
	fs.exists(localpath, function(result) {
		getFile(result, response, localpath);
	});
}
var server = http.createServer(getFilename);*/

// -- socket.io --
// Chargement
// var io = require('socket.io').listen(server);

// Requetes
/*io.sockets.on('connection', function(socket) {
	// Message à la connection
	console.log('Connexion socket : Ok');
	socket.emit('message', 'Connexion : Ok');
	// Le serveur reçoit un message" du navigateur
	socket.on('message', function(msg) {
		//console.log(msg);
		socket.emit('message', 'llez patienter !\n');
		arduino.write(msg, function(err) {
			if (err) {
				io.sockets.emit('message', err.message);
				return console.log('Error: ', err.message);
			}
		});
	});
});

arduino.on('data', function(data) {
	let buf = new Buffer(data);
	io.sockets.emit('message', buf.toString('ascii'));
	console.log(buf.toString('ascii'));
	//console.log(buf);
});

server.listen(8080);*/
console.log('Serveur : Ok');
