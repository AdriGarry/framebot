#!/usr/bin/env node
'use strict';

const logger = require('./Logger');

const log = new logger(__filename);

module.exports = class Scheduler {
 
	static delay(sec) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, sec * 1000);
		});
	}

	static delayMs(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}
	
	static decrement(id, delayToTimeout, endCallback, stepDelay = 60, decrementCallback){
		log.info('starting decrement', id, 'stepsToTimeout='+delayToTimeout/stepDelay, 'delayToTimeout='+delayToTimeout, 'stepDelay='+stepDelay);
		delayToTimeout = delayToTimeout * stepDelay;
		Scheduler.decrementRecursive(id, delayToTimeout, endCallback, stepDelay, decrementCallback);
	}

	static stopDecrement(id, endCallback){
		log.info('endind decrement', id);
		clearTimeout(timeouts[id]);
		if(endCallback){
			endCallback(id);
		}
	}

	static decrementRecursive(id, delayToTimeout, endCallback, stepDelay, decrementCallback){
		log.info('decrement', id, 'stepsToTimeout='+delayToTimeout/stepDelay, 'delayToTimeout='+delayToTimeout, 'stepDelay='+stepDelay);
		if(delayToTimeout <= 0){
			clearTimeout(timeouts[id]);
			log.info('End decrement', id);// pourquoi ce log n'apparait pas ?
			log.test('End decrement, pourquoi ce log n\'apparait pas ?', id);// pourquoi ce log n'apparait pas ?
			return endCallback(id);
      }
      timeouts[id] = setTimeout(()=>{
         if(decrementCallback){
            decrementCallback(id);
         }
         Scheduler.decrementRecursive(id, delayToTimeout - stepDelay, endCallback, stepDelay, decrementCallback);
      }, stepDelay*1000);
	}

   static debounce(func, wait, immediate, context) {
      log.trace('debounce', func, wait, immediate, context);
		let result;
		let timeout = null;
		return function () {
			let ctx = context || this,
				args = arguments;
			let later = function () {
				timeout = null;
				if (!immediate) result = func.apply(ctx, args);
			};
			let callNow = immediate && !timeout;
			// Tant que la fonction est appelée, on reset le timeout.
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) result = func.apply(ctx, args);
			return result;
		};
	}

	static throttle(func, wait, leading, trailing, context) {
      log.trace('throttle', func, wait, leading, trailing, context)
		let ctx, args, result;
		let timeout = null;
		let previous = 0;
		let later = function () {
			previous = new Date();
			timeout = null;
			result = func.apply(ctx, args);
		};
		return function () {
			let now = new Date();
			if (!previous && !leading) previous = now;
			let remaining = wait - (now - previous);
			ctx = context || this;
			args = arguments;
			// Si la période d'attente est écoulée
			if (remaining <= 0) {
				// Réinitialiser les compteurs
				clearTimeout(timeout);
				timeout = null;
				// Enregistrer le moment du dernier appel
				previous = now;
				// Appeler la fonction
				result = func.apply(ctx, args);
			} else if (!timeout && trailing) {
				// Sinon on s’endort pendant le temps restant
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	}

}

let timeouts = {};
