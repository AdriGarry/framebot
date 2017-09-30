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
	log.info('inspect()', flux);
	log.debug('Button[' + flux.id + ']', flux.value, flux.param?flux.param:'');
	if(flux.hasOwnProperty('delay') && Number(flux.delay)){
		log.info('--> flux.delay', Number(flux.delay));
		delete flux.delay;
		delay(flux);
	}
	return;
};

function delay(flux){
	log.info('delay()', flux);
	setTimeout(function(){
		log.debug('delayed flux:', flux)
	}, Number(flux.delay)*1000);
};

var buttonHandler = flux => {
	log.info('buttonHandler', flux);
	// actions to define here...
}

// test if object isObservable https://stackoverflow.com/questions/41452179/check-if-object-is-an-rxjs5-observable
var Button = require(Odi.CORE_PATH + 'controllers/button.js'); // log.info(button instanceof Rx.Observable);
Button.subscribe({
	next: flux => {
		inspect(flux);
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
		inspect(flux);
		// log.debug('Jobs[' + data.id + ']', data.value, data.param?data.param:'');
		if(flux.id == 'clock'){
			services.time.next({id:'now', value: null});
		}else{
			log.info('Jobs[else]', flux.value, flux.param);
		}
	},
	error: err => { Odi.error(err) }
});

