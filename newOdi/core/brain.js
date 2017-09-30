#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js');
var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
console.log('==>Odi');
console.log(Odi);
var log = new (require(Odi.CORE_PATH + 'logger.js'))(__filename.match(/(\w*).js/g)[0]);

console.log('Odi.error:');
console.log(Odi.error);

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

var buttonHandler = data => {
	log.info('buttonHandler', data);
	// actions to define here...
}

// test if object isObservable https://stackoverflow.com/questions/41452179/check-if-object-is-an-rxjs5-observable
var button = require(Odi.CORE_PATH + 'controllers/button.js'); // log.info(button instanceof Rx.Observable);
button.subscribe({
	next: data => {
		if(data.id == 'ok'){
			log.info('Brain: Ok button', data);
			time.next({id:'bip', value: 'ok'});
		}else if(data.id == 'cancel'){
			log.info('Brain: Cancel button...', data);
			sound.next({id:'bip', value:'cancel'});
		}else if(data.id == 'blue'){
			Odi.error(data);
		}else{
			log.info('Brain: (else statement)', data);
		}
	},
	error: err => { Odi.error(data) }
});

