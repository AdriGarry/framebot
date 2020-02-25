#!/usr/bin/env node

'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(_PATH + 'src/core/Logger.js'))(__filename),
	Utils = require(_PATH + 'src/api/Utils.js');

module.exports = class CoreError extends Error {
	constructor(message, data, displayStack) {
		super(message);
		this.name = this.constructor.name;
		this.time = Utils.logTime();
		this.data = data;
		this.displayStack = typeof displayStack !== 'undefined' ? displayStack : true;
		this.log();
		this.notify();
		this.persist();
	}

	log() {
		log.error(this.name + ': ' + this.message);
		if (this.data) {
			console.log(this.data);
		}
		if (this.displayStack) {
			this.stack = this.getStackTrace();
			console.log(this.stack);
		}
	}

	getStackTrace() {
		let stack = this.stack.split('\n');
		stack.shift();
		return stack.join('\n');
	}

	notify() {
		Core.do('interface|led|altLeds', { speed: 30, duration: 1.5 }, { log: 'trace' });
		Core.do('interface|sound|error', null, { log: 'trace' });
	}

	persist() {
		let logError = {
			message: this.message,
			data: this.data,
			time: this.time
		};
		Utils.appendJsonFile(Core._LOG + Core.name + '_errorHistory.json', logError);
		Core.errors.push(logError);
	}
};
