#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.debug(Odi.conf);

const Rx = require('rxjs');
var Flux = {
	controller: {
		button: {},
		hardware: {},
		jobs: {}
	},
	module: {
		hardware: new Rx.Subject(),
		led: new Rx.Subject(),
		sound: new Rx.Subject()
	},
	service: {
		mood: new Rx.Subject(), // random, exclamation, badBoy, party, [cigales ?]
		music: new Rx.Subject(), // fip, jukebox
		time: new Rx.Subject(),
		tools: new Rx.Subject(), // ??
		tts: new Rx.Subject(), // +voicemail ?
		system: new Rx.Subject(),
		util: new Rx.Subject(),
		video: new Rx.Subject(),
	}
};

module.exports = {
	//delay: delay,
	inspect: inspect,
	module: Flux.module,
	next: next, // object à définir (pour toString() etc...)
	service: Flux.service
};

function next() {
	log.info('=> ', arguments);
}

function inspect(flux, subject) {
	log.debug('Incoming flux [' + subject + ']', flux);
	if (flux.hasOwnProperty('delay') && Number(flux.delay)) {
		delay(flux, subject);
		return false;
	}
	return true;
};

function delay(flux, subject) {
	log.info('Delaying flux [' + subject + ', ' + flux.delay + ']', flux);
	setTimeout(function () {
		//flux.Jobs.next(flux);
		log.info('----------------');
		log.info(subject);
		log.info(flux);
		log.info('----------------');
		if (Flux.hasOwnProperty(subject.type) && Flux[subject.type].hasOwnProperty(subject.id)) {
			// log.debug('OKAY TO RELANCH FLUX !!');
			Flux[subject.type][subject.id].next(flux);
		} else {
			Odi.error('Can\'t relaunch flux', subject, flux);
		}
	}, Number(flux.delay) * 1000);
	delete flux.delay;
	return;
};

var buttonHandler = flux => {
	log.info('buttonHandler', flux);
	// actions to define here...
	// utiliser des switch/case (voir si possible avec plusieurs params)
}

Flux.controller.button = require(Odi.CORE_PATH + 'controllers/button.js');
//log.info(Flux.controller);
Flux.controller.button.subscribe({
	next: flux => {
		if (!inspect(flux, { type: 'controller', id: 'jobs' })) return;
		if (flux.id == 'ok') {
			Flux.service.time.next({ id: 'bip', value: 'ok' });
		} else if (flux.id == 'cancel') {
			Flux.module.sound.next({ id: 'bip', value: 'cancel' });
		} else if (flux.id == 'blue') {
			Odi.error(flux);
		} else {
			log.info('Button[else]', flux);
		}
	},
	error: err => { Odi.error(flux) }
});

// Faire un script qui lance un flux de test sur chaque Sujet
// {id:'test', value:'all'}
// {to:'test', value:'all'}

Flux.controller.jobs = require(Odi.CORE_PATH + 'controllers/jobs.js');
Flux.controller.jobs.subscribe({
	next: flux => {
		if (!inspect(flux, { type: 'controller', id: 'jobs' })) return;
		if (flux.id == 'clock') {
			Flux.service.time.next({ id: 'now', value: null });
		} else if (flux.id == 'sound') {
			Flux.module.led.next({ id: 'blink', value: { leds: ['nose'], speed: 100, loop: 1 } });
		} else {
			log.info('Jobs[else]', flux);
		}
	},
	error: err => { Odi.error(err) }
});

