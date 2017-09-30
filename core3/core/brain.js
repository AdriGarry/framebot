#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');
var log = new (require(ODI.path.CORE_PATH + 'logger.js'))(__filename.match(/(\w*).js/g)[0]);

const Rx = require('rxjs');
var action = new Rx.Subject();
var led = new Rx.Subject();
var sound = new Rx.Subject();
var time = new Rx.Subject();
var util = new Rx.Subject();

module.exports = {
	action: action,
	led: led,
	sound: sound,
	time: time,
	util: util
};

var handler = data => {
	log.info('handler', data);
	// actions to define here...
}

var errorHandler = err => {
	log.error(err);
	throw new Error('Brain: Odi Error to define from button flux', err)
};

// test if object isObservable https://stackoverflow.com/questions/41452179/check-if-object-is-an-rxjs5-observable

var button = require(ODI.path.CORE_PATH + 'controllers/button.js');
// log.info(button instanceof Rx.Observable);
log.info('button', 'BUTTON', button);
button.subscribe({
	next: data => {
		// log.info('Brain:', data);
		if(data.id == 'ok'){
			log.info('Brain: Ok button', data);
			time.next({id:'bip', value: 'ok'});
		}else if(data.id == 'cancel'){
			log.info('Brain: Cancel button...', data);
			sound.next({id:'bip', value:'cancel'});
		}else if(data.id == 'blue'){
			throw new Error('Brain: >> Odi Error from BLUE button', data);
		}else{
			log.info('Brain: (else statement)', data);
		}
	},
	error: err => { errorHandler(err) }
});

// Services
// var soundService = require(ODI.path.CORE_PATH + 'services/soundService.js');
// var timeService = require(ODI.path.CORE_PATH + 'services/timeService.js');
