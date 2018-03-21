#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');
var SerialPort = require('serialport');

const ARDUINO = { address: '/dev/ttyACM0', baudRate: 115200 };
var arduino;

Flux.interface.arduino.subscribe({
	next: flux => {
		if (flux.id == 'connect') {
			connect();
		} else if (flux.id == 'write') {
			write(flux.value);
		} else if (flux.id == 'stop') {
			disconnect(flux.value);
		} else {
			Odi.error('unmapped flux in Arduino interface', flux, false);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

connect();

function connect() {
	arduino = new SerialPort(ARDUINO.address, { baudRate: ARDUINO.baudRate }, function(err) {
		if (err) {
			Odi.error('Error opening arduino port: ', err.message, false);
			// TODO Scheduler to retry connect...?
			if (!Odi.run('alarm') && Odi.run('etat') == 'high') {
				Flux.next('interface|tts|speak', { lg: 'en', msg: 'Max is not available' });
			}
			Odi.run('max', false);
		} else {
			log.info('arduino serial channel opened');
			Odi.run('max', true);
			// if (Odi.isAwake() && !Odi.run('alarm') && Odi.run('etat') == 'high')
			// 	Flux.next('interface|tts|speak', { lg: 'en', msg: 'Max Contact!' });
		}
		// log.INFO('-->');
		// log.info(typeof arduino, arduino);
	});
}

function disconnect() {
	log.debug('Max serial channel disconnection...');
	if (arduino instanceof SerialPort) arduino.close();
}

/** Function to send message to arduino */
function write(msg) {
	log.debug('write()', msg);
	if (!Odi.run('max')) {
		log.INFO('Max not available!');
		return;
	}
	arduino.write(msg + '\n', function(err, data) {
		if (err) {
			Odi.error('Error while writing to arduino', err);
		}
		log.DEBUG('data:', data);
	});
}

const Readline = SerialPort.parsers.Readline;
var feedback = arduino.pipe(new Readline({ delimiter: '\r\n' }));
feedback.on('data', function(data) {
	log.debug(data);
	Flux.next('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { hidden: true });
	Flux.next('service|max|parse', data.trim(), { hidden: true });
});

arduino.on('close', function(data) {
	data = String(data);
	if (data.indexOf('bad file descriptor') >= 0) {
		Odi.error('Max is disconnected', data, false);
		Flux.next('interface|tts|speak', { lg: 'en', msg: "I've just lost my connexion with Max!" });
	}
	Odi.run('max', false);
	log.INFO('Max serial channel disconnected!');
	// setTimeout(() => {
	// 	log.info('Trying to connect to Max...');
	// 	connect();
	// }, 5000);
});
