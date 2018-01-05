#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');

Flux.module.arduino.subscribe({
	// TODO: ABSOLUMENT BLOQUER LES SONS EN MODE SLEEP !!
	next: flux => {
		if (flux.id == 'write') {
			write(flux.value);
		} else if (flux.id == 'hi') {
			Flux.next('module', 'arduino', 'write', 'hi', 2, 2);
		} else if (flux.id == 'sleep') {
			Flux.next('module', 'arduino', 'write', 'break', 2, 2);
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

const ARDUINO = '/dev/ttyACM0';
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

/** Function to send message to arduino */
function write(msg) {
	log.debug('write()', msg);
	arduino.write(msg + '..', function(err) {
		if (err) {
			console.log('Error: ', err.message);
		}
	});
}

feedback.on('data', function(data) {
	Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 80, loop: 3 }, null, null, true);
	log.info('Max:', data.trim());
});

arduino.on('close', function(data) {
	// Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 80, loop: 3 }, null, null, true);
	// log.info(typeof data, data);
	data = data.toString();
	// log.info(typeof data, data);
	if (data.indexOf('bad file descriptor') >= 0) {
		Odi.error('Max is disconnected', data, false);
	}
});

log.info('Opening communication serie with Arduino');
