var initLock = function(obj, file) {
	console.log('initLock(obj, file)', obj, file);
	return lockedFunctions;
};

/**
 * run(), run(id), run(id, value)
 * @param {*} runtimeId
 * @param {*} newRuntimeValue
 */
var lockedFunctions = function(runtimeId, newRuntimeValue) {
	if (!runtimeId) return _runtime; //return all
	if (typeof newRuntimeValue !== 'undefined')
		return _setRuntimeValue(runtimeId, newRuntimeValue); //set value
	else return _getRuntimeValue(runtimeId); //get value
};
var _getRuntimeValue = function(runtimeId) {
	if (_runtime.hasOwnProperty(runtimeId)) {
		return _runtime[runtimeId];
	} else if (runtimeId.indexOf('.' > -1)) {
		var keys = runtimeId.split('.');
		return _runtime[keys[0]][keys[1]];
	} else {
		return log.info('_getRuntimeValue ERROR:', runtimeId);
	}
};
var _setRuntimeValue = function(runtimeId, newRuntimeValue) {
	var runtimeId2;
	if (runtimeId.indexOf('.') > -1) {
		var keys = runtimeId.split('.');
		runtimeId = keys[0];
		runtimeId2 = keys[1];
	}
	if (_runtime.hasOwnProperty(runtimeId)) {
		if (Array.isArray(_runtime[runtimeId])) {
			_runtime[runtimeId].push(newRuntimeValue);
		} else {
			if (runtimeId2) _runtime[keys[0]][keys[1]] = newRuntimeValue;
			else _runtime[runtimeId] = newRuntimeValue;
			// _runtime[runtimeId] = newRuntimeValue;
		}
		return true;
		// Flux.next('module', 'runtime', 'update', {id:runtimeId, value: newRuntimeValue}, null, null, true);
	} else {
		log.info('_setRuntimeValue ERROR:', runtimeId);
		// Flux.next('module', 'runtime', 'update', {id:runtimeId, value: newRuntimeValue}, null, null, true);
		return false;
	}
};
module.exports.initLock = initLock;
