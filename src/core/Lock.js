#!/usr/bin/env node
'use strict';

var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');

var Flux = {};
setTimeout(() => {
	Flux = require(ODI_PATH + 'src/core/Flux.js');
	console.log(Flux.next);
}, 100);

function Lock(obj, file) {
	var self = this;
	this._obj = obj;
	return _functions;

	function _functions(id, newValue) {
		if (!id) return self._obj; //return all
		if (typeof newValue !== 'undefined')
			return _setter(id, newValue); //set value
		else return _getter(id); //get value
	}

	function _getter(id) {
		if (self._obj.hasOwnProperty(id)) {
			return self._obj[id];
		} else if (id.indexOf('.' > -1)) {
			var keys = id.split('.');
			return self._obj[keys[0]][keys[1]];
		} else {
			return log.error('_getObjValue ERROR:', id);
		}
	}

	function _setter(id, newValue) {
		var id2;
		if (id.indexOf('.') > -1) {
			var keys = id.split('.');
			id = keys[0];
			id2 = keys[1];
		}
		if (self._obj.hasOwnProperty(id)) {
			if (Array.isArray(self._obj[id])) {
				self._obj[id].push(newValue);
			} else {
				if (id2) self._obj[keys[0]][keys[1]] = newValue;
				else self._obj[id] = newValue;
			}
			if (Flux.next) {
				// console.log('------YES');
				//Flux.next('module', 'conf', 'updated', { id: id, value: newValue }, null, null, false);
			}
			return true;
		} else {
			log.error('_setObjValue ERROR:', id);
			return false;
		}
	}
}

module.exports = Lock;
