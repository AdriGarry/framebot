// var Flux = require(ODI_PATH + 'src/core/Flux.js');
var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);

function Lock(obj, file) {
	var self = this;
	this._obj = obj;
	// log.info('initLock(obj, file)', /*obj,*/ file);
	return lockedFunctions;

	function lockedFunctions(id, newValue) {
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
			return log.info('_getObjValue ERROR:', id);
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
			return true;
			// Flux.next('module', 'runtime', 'update', {id:runtimeId, value: newRuntimeValue}, null, null, true);
		} else {
			log.info('_setObjValue ERROR:', id);
			// Flux.next('module', 'runtime', 'update', {id:runtimeId, value: newRuntimeValue}, null, null, true);
			return false;
		}
	}
}

module.exports = Lock;
