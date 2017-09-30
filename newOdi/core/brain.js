#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename.match(/(\w*).js/g)[0]);
log.debug(Odi.conf);

const Rx = require('rxjs');
var services = {
	mood: new Rx.Subject(), // random, exclamation, badBoy, party, [cigales ?]
	music: new Rx.Subject(), // fip, jukebox
	time: new Rx.Subject(),
	tools: new Rx.Subject(), // ??
	tts: new Rx.Subject(), // +voicemail ?
	util: new Rx.Subject(),
	video: new Rx.Subject(),
};

var modules = {
	hardware: new Rx.Subject(),
	led: new Rx.Subject(),
	sound: new Rx.Subject()
};

module.exports = {
	delay: delay,
	inspect: inspect,
	module: modules,
	service: services
};

function inspect(flux){
	// log.info('inspect()', flux);
	log.debug('Inspect=', flux);
	if(flux.hasOwnProperty('delay') && Number(flux.delay)){
		// log.info('--> flux.delay', Number(flux.delay));
		delay(flux);
		return false;
	}
	return true;
};

function delay(flux){
	log.info('Delay=', flux.delay, flux);
	setTimeout(function(){
		log.debug('delayed flux:', flux);
		// ...
		//Jobs.next({id:'titi', value: '__end!'});
	}, Number(flux.delay)*1000);
	delete flux.delay;
	return;
};

var buttonHandler = flux => {
	log.info('buttonHandler', flux);
	// actions to define here...
}

// test if object isObservable https://stackoverflow.com/questions/41452179/check-if-object-is-an-rxjs5-observable
var Button = require(Odi.CORE_PATH + 'controllers/button.js'); // log.info(button instanceof Rx.Observable);
Button.subscribe({
	next: flux => {
		if(!inspect(flux)) return;
		if(flux.id == 'ok'){
			services.time.next({id:'bip', value: 'ok'});
		}else if(flux.id == 'cancel'){
			modules.sound.next({id:'bip', value:'cancel'});
		}else if(flux.id == 'blue'){
			Odi.error(flux);
		}else{
			log.info('Button[else]', flux);
		}
	},
	error: err => { Odi.error(flux) }
});

var Jobs = require(Odi.CORE_PATH + 'controllers/jobs.js'); // log.info(Jobs instanceof Rx.Observable);
Jobs.subscribe({
	next: flux => {
		if(!inspect(flux)) return;
		if(flux.id == 'clock'){
			services.time.next({id:'now', value: null});
		}else{
			log.info('Jobs[else]', flux);
		}
	},
	error: err => { Odi.error(err) }
});

