#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);
const Flux = require(Core._CORE + 'Flux.js');
const Utils = require(Core._CORE + 'Utils.js');
const SerialPort = require('serialport');

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
			Core.error('unmapped flux in Arduino interface', flux, false);
		}
	},
	error: err => {
		Core.error(flux);
	}
});

connect();

function connect() {
	arduino = new SerialPort(ARDUINO.address, { baudRate: ARDUINO.baudRate }, function(err) {
		if (err) {
			Core.error('Error opening arduino port: ', err.message, false);
			// TODO Scheduler to retry connect...?
			if (!Core.run('alarm') && Core.run('etat') == 'high') {
				Core.do('interface|tts|speak', { lg: 'en', msg: 'Max is not available' });
			}
			Core.run('max', false);
		} else {
			log.info('arduino serial channel opened');
			Core.run('max', true);
			// if (Core.isAwake() && !Core.run('alarm') && Core.run('etat') == 'high')
			// 	Core.do('interface|tts|speak', { lg: 'en', msg: 'Max Contact!' });
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
	if (!Core.run('max')) {
		log.INFO('Max not available!');
		return;
	}
	arduino.write(msg + '\n', function(err, data) {
		if (err) {
			Core.error('Error while writing to arduino', err);
		}
		log.DEBUG('data:', data);
	});
}

const Readline = SerialPort.parsers.Readline;
var feedback = arduino.pipe(new Readline({ delimiter: '\r\n' }));
feedback.on('data', function(data) {
	log.debug(data);
	Core.do('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { hidden: true });
	Core.do('service|max|parse', data.trim(), { hidden: true });
});

arduino.on('close', function(data) {
	data = String(data);
	if (data.indexOf('bad file descriptor') >= 0) {
		Core.error('Max is disconnected', data, false);
		Core.do('interface|tts|speak', { lg: 'en', msg: "I've just lost my connexion with Max!" });
	}
	Core.run('max', false);
	log.INFO('Max serial channel disconnected!');
	// setTimeout(() => {
	// 	log.info('Trying to connect to Max...');
	// 	connect();
	// }, 5000);
});
