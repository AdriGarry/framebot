#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');

Flux.module.arduino.subscribe({
	next: flux => {
		if (flux.id == 'write') {
			write(flux.value);
		} else if (flux.id == 'hi') {
			wakeUp();
		} else if (flux.id == 'sleep') {
			sleep();
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
var arduino = new SerialPort(ARDUINO, function(err) {
	if (err) {
		// return console.log('Error opening arduino port:', err.message);
		Odi.error('Error opening arduino port: ', err.message, false);
		// Scheduler to retry connect...?
	} else {
		log.info('communication serie with arduino opened');
		Odi.run('max', true);
		// Flux.next('module', 'tts', 'speak', { lg: 'en', msg: "I'm connected with Max!" });
		// if (!Odi.run('alarm') && Odi.isAwake()) Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'Hey Max!' });
	}
});

const RETRY_TIMEOUT = 5 * 60 * 1000;

var wakeUpCount = 0;
function wakeUp() {
	wakeUpCount++;
	if (wakeUpCount > 5) {
		wakeUpCount = 0;
		log.INFO('On retente dans ' + RETRY_TIMEOUT / 60000 + ' minutes...');
		setTimeout(() => {
			wakeUp();
		}, RETRY_TIMEOUT);
		return;
	}
	log.debug('wakeUp()');
	Flux.next('module', 'arduino', 'write', 'hi');
	setTimeout(() => {
		if (Odi.run('max') == false) wakeUp();
	}, 2500);
}

var sleepCount = 0;
function sleep() {
	sleepCount++;
	if (sleepCount > 5) {
		sleepCount = 0;
		// log.INFO('Truc à corriger pour éviter que ça boucle indéfiniment...');
		log.INFO('On retente dans ' + RETRY_TIMEOUT / 60000 + ' minutes...');
		setTimeout(() => {
			sleep();
		}, RETRY_TIMEOUT);
		return;
	}
	log.debug('sleep()');
	Flux.next('module', 'arduino', 'write', 'break');
	setTimeout(() => {
		if (Odi.run('max')) sleep();
	}, 2500);
}

/** Function to send message to arduino */
function write(msg) {
	log.debug('write()', msg);
	arduino.write(msg + '..', function(err) {
		if (err) {
			Odi.error('Error while writing to arduino', err);
		}
	});
}

const Readline = SerialPort.parsers.Readline;
const feedback = arduino.pipe(new Readline({ delimiter: '\r\n' }));
feedback.on('data', function(data) {
	Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 80, loop: 3 }, null, null, true);
	arduinoParser(data.trim());
});

function arduinoParser(data) {
	log.debug('arduinoParser:', data); // debug ??
	switch (data) {
		case "I'm Taking a break...":
			log.INFO('max is asleep');
			Odi.run('max', false);
			break;
		case 'hi..':
			log.INFO('max is awake!');
			Odi.run('max', true);
			break;
		case 'blinkLed':
			if (Odi.run('etat') == 'high') Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'blink led' });
			break;
		case 'playMelody':
			if (Odi.run('etat') == 'high') Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'melody' });
			break;
		case 'playRandomMelody':
			if (Odi.run('etat') == 'high') Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'ranndom melody' });
			break;
		case 'turn':
			if (Odi.run('etat') == 'high') Flux.next('module', 'tts', 'speak', { lg: 'en', msg: 'turn' });
			break;
		default:
			log.info('max data:', data);
			break;
	}
	log.INFO('Set action or TTS here...');
}
// playMelody
// playRandomMelody
// turn
// blinkLed
// Et, doucement la!
// Mais non, calme toi Max !
// Non mais c'est pas fini ?
// Tu vas t'arrêter oui ?
// Max, donne/sonne l'alarme! -> horn

arduino.on('close', function(data) {
	// Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 80, loop: 3 }, null, null, true);
	// log.info(typeof data, data);
	data = data.toString();
	// log.info(typeof data, data);
	if (data.indexOf('bad file descriptor') >= 0) {
		Odi.error('Max is disconnected', data, false);
		Flux.next('module', 'tts', 'speak', { lg: 'en', msg: "I've just lost my connexion with Max!" });
	}
});
