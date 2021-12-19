#!/usr/bin/env node

'use strict';

const util = require('util');

const Core = require('../core/Core.js').api;

const logger = require('./Logger.js'),
  Utils = require('./Utils'),
  Observers = require('./Observers');

const log = new logger(__filename);

const LOG_LEVELS = ['info', 'debug', 'trace'],
  FLUX_REGEX = new RegExp(/(?<type>\w+)\|(?<subject>\w+)\|(?<id>\w+)/);

module.exports = class Flux {
  constructor(idParam, data, conf) {
    if (!Observers.isReady()) {
      Core.error('Flux manager not yet ready');
      return;
    }

    if (Array.isArray(idParam)) {
      idParam.forEach(flux => {
        new Flux(flux.id, flux.data, flux.conf);
      });
      return;
    }

    if (typeof idParam === 'object' && idParam.hasOwnProperty('id')) {
      new Flux(idParam.id, idParam.data, idParam.conf);
      return;
    }

    if (!conf) conf = {};
    try {
      let matchObj = FLUX_REGEX.exec(idParam);
      this.type = matchObj.groups.type;
      this.subject = matchObj.groups.subject;
      this.id = matchObj.groups.id;
    } catch (err) {
      Core.error('Invalid Flux structure', { idParam: idParam });
    }
    this.value = data;
    this.delay = Number(conf.delay) || 0;
    this.loop = Number(conf.loop) || 1;
    this.log = conf.log || 'info';
    if (!Utils.searchStringInArray(this.log, LOG_LEVELS)) {
      this.error = 'Invalid Flux log level';
    }

    if (!this.isValid()) return;

    if (this.delay && Number(this.delay)) {
      this.schedule();
      return;
    }

    Core.run('stats.fluxCount', Core.run('stats.fluxCount') + 1);
    this.fire();
  }

  isValid() {
    if (this.error) {
      Core.error(this.error, this);
      return false;
    } else if (!Observers.modules().includes(this.type) || !Observers[this.type]().hasOwnProperty(this.subject)) {
      log.warn('Invalid Flux id: ' + this.type, this.subject);
      return false;
    }
    return true;
  }

  schedule() {
    let i = 0;
    let interval = setInterval(() => {
      this.fire();
      i++;
      if (i == this.loop) {
        clearInterval(interval);
      }
    }, Number(this.delay) * 1000);
  }

  fire() {
    log[this.log]('> Flux', this.toString());
    Observers[this.type]()[this.subject].next({
      id: this.id,
      value: this.value
    });
  }

  toString() {
    let typeSubject = this.type + '|' + this.subject + '|';
    let value = this.id + (this.value ? ' ' + util.format(util.inspect(this.value)) : '') + ' ';
    let delay = ' ' + (this.delay || '');
    let loop = ' ' + (this.loop > 1 ? this.loop : '');
    return typeSubject + value + delay + loop;
  }
};
