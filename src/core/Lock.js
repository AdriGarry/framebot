#!/usr/bin/env node
'use strict';

const fs = require('fs');

const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);

/** accessor: object([id, value]) */
function Lock(obj, file) {
	let self = this;
	self._obj = obj;
	if (file) {
		self.file = file;
	} else {
		self.file = false;
	}
	// Object.seal(self);
	return _accessors;

	function _accessors(id, newValue) {
		if (!id) return self._obj; //return all object
		if (typeof newValue !== 'undefined') return _setter(id, newValue);
		//set value
		else return _getter(id); //get value
	}

	function _getter(id) {
		if (id.indexOf('.') > -1) {
			let keys = id.split('.');
			return self._obj[keys[0]][keys[1]];
		} else if (self._obj.hasOwnProperty(id)) {
			return self._obj[id];
		} else {
			log.error('_getObjValue ERROR:', id);
			return false;
		}
	}

	function _setter(id, newValue) {
		if (self.file) {
			log.debug('Updating: ' + id + '=' + newValue);
			_setValue(self._obj, id, newValue);
			fs.writeFileSync(self.file, JSON.stringify(self._obj, null, 1));
		} else {
			_setValue(self._obj, id, newValue);
		}
	}

	function _setValue(object, id, newValue) {
		let id2;
		if (id.indexOf('.') > -1) {
			let keys = id.split('.');
			id = keys[0];
			id2 = keys[1];
		}
		if (object.hasOwnProperty(id)) {
			if (Array.isArray(object[id])) {
				object[id].push(newValue);
			} else {
				if (id2) object[id][id2] = newValue;
				else object[id] = newValue;
			}
		} else {
			log.error('setValue ERROR:', id);
		}
	}
}

module.exports = Lock;
