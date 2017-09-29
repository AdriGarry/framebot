#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');
var log = new (require(ODI.path.CORE_PATH + 'logger.js'))(__filename.match(/(\w*).js/g)[0]);

const Rx = require('rxjs');

log.debug('from brain', {id:1, label:'label'});

ODI.flux.action = new Rx.Subject();

var handler = data => {
	log.info('handler', data);
	// actions to define here...
}

var errorHandler = err => {throw new Error('Brain: Odi Error to define from button flux', err)}

// test if object isObservable
// https://stackoverflow.com/questions/41452179/check-if-object-is-an-rxjs5-observable

ODI.flux.button.subscribe({
	next: data => {
		// log.info('Brain:', data);
		if(data.id == 'ok'){
			log.info('Brain: Ok button', data);
			ODI.flux.action.next({id:'bip', value: 'ok'});
		}else if(data.id == 'cancel'){
			log.info('Brain: Cancel button...', data);
			ODI.flux.action.next({id:'bip', value:'cancel'});
		}else if(data.id == 'blue'){
			throw new Error('Brain: >> Odi Error from BLUE button', data);
		}else{
			log.info('Brain: (else statement)', data);
		}
	},
	// error: err => {throw new Error('Brain: Odi Error to define from button flux', err)}
	error: err => {errorHandler(err)}
});