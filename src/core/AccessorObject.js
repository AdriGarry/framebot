#!/usr/bin/env node
'use strict';

const fs = require('fs');

const Logger = require('../api/Logger');

const log = new Logger(__filename);

function SharedObject(name, obj) {
  let self = this;
  self._name = name;
  _setupSharedObjectFromObjectOrFile(obj);
  return _accessors;

  function _setupSharedObjectFromObjectOrFile(objectOrFile) {
    if (typeof objectOrFile === 'object') {
      self._obj = obj;
      self.filePath = false;
      self.lastModified = new Date();
    } else {
      self.filePath = objectOrFile;
      self._obj = require(self.filePath);
      self.lastModified = fs.statSync(self.filePath).mtime;
    }
  }

  /** accessor: object([id, value]) */
  function _accessors(id, newValue) {
    if (!id) return self._obj; //return all object
    if (typeof newValue !== 'undefined') return _setter(id, newValue);
    //set value
    else return _getter(id); //get value
  }

  function _getter(id) {
    if (id === '_lastModified') {
      return self.lastModified;
    }
    let value = self._obj;
    for (const key of id.split('.')) {
      if (value === null || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, key)) {
        log.error(`No entry for '${id}' property in ${self._name} object!`);
        return false;
      }
      value = value[key];
    }
    return value;
  }

  function _setter(id, newValue) {
    if (self.filePath) {
      log.debug('Updating: ' + id + '=' + newValue);
      _setValue(self._obj, id, newValue);
      fs.writeFileSync(self.filePath, JSON.stringify(self._obj, null, 1));
      self.lastModified = fs.statSync(self.filePath).mtime;
    } else {
      _setValue(self._obj, id, newValue);
      self.lastModified = new Date();
    }
  }

  function _setValue(object, id, newValue) {
    const keys = id.split('.');
    const lastKey = keys.pop();
    const parent = keys.reduce((obj, key) => {
      if (obj[key] === null || typeof obj[key] !== 'object') obj[key] = {};
      return obj[key];
    }, object);
    parent[lastKey] = newValue;
  }
}

module.exports = SharedObject;
