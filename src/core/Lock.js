#!/usr/bin/env node
'use strict';

const fs = require('fs');

const Logger = require('./../api/Logger');

const log = new Logger(__filename);

/** accessor: object([id, value]) */
function Lock(obj, filePath) {
  let self = this;
  self._obj = obj;
  if (filePath) {
    self.filePath = filePath;
  } else {
    self.filePath = false;
  }
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
      log.error('_getObjValue ERROR:', id); // TODO improve this log?
      return false;
    }
  }

  function _setter(id, newValue) {
    if (self.filePath) {
      log.debug('Updating: ' + id + '=' + newValue); // TODO improve this log?
      _setValue(self._obj, id, newValue);
      fs.writeFileSync(self.filePath, JSON.stringify(self._obj, null, 1));
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
      log.error('ERROR can not set value for unknow property', id); // TODO improve this log?
    }
  }
}

module.exports = Lock;
