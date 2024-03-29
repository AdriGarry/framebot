#!/usr/bin/env node

'use strict';

const Rx = require('rxjs');

const Core = require('../core/Core.js').api;

const logger = require('./Logger.js');

const log = new logger(__filename);

let ready = false,
  modulesTypes = [],
  ObserversObjects = { interface: {}, service: {} };

module.exports = class Observers {
  static init(observers) {
    log.debug('initializing observers...');

    Object.keys(observers).forEach(key => {
      let proto = key.substring(0, key.length - 1);
      modulesTypes.push(proto);
      ObserversObjects[proto] = {};

      Object.keys(observers[key]).forEach(key2 => {
        let tmp = observers[key][key2];
        tmp.forEach(index => {
          ObserversObjects[proto][index] = new Rx.Subject();
        });
      });
    });
    ready = true;
    log.info('Observers attached, flux manager ready');
    return ObserversObjects;
  }

  static attachFluxParseOptions(type, subject, fluxParseOptions) {
    log.trace('attachFluxParseOptions', type, subject);
    Observers[type]()[subject].subscribe({
      next: flux => {
        let found = fluxParseOptions.find(option => option.id === flux.id);
        if (found) {
          if (found.condition && found.condition.hasOwnProperty('isAwake')) {
            if (found.condition.isAwake === Core.isAwake()) return found.fn(flux.value);
          } else return found.fn(flux.value);
        } else Core.error(`unmapped flux in ${subject} ${type}`, flux);
      },
      error: err => Core.error('Flux error', err)
    });
  }

  static attachFluxParser(type, subject, fluxParser) {
    log.trace('attachFluxParser', type, subject);
    Observers[type]()[subject].subscribe({
      next: flux => fluxParser(flux),
      error: err => Core.error('Flux error', err)
    });
  }

  static isReady() {
    return ready;
  }

  static modules() {
    return modulesTypes;
  }

  static interface() {
    return ObserversObjects.interface;
  }

  static service() {
    return ObserversObjects.service;
  }
};
