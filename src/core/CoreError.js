#!/usr/bin/env node

'use strict';

const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);
const Core = require(_PATH + 'src/core/Core.js').Core;
const Utils = require(_PATH + 'src/core/Utils.js');

module.exports = class CoreError extends Error {
	constructor(message, data, displayStack) {
		super(message);
		this.name = this.constructor.name;
		this.time = Utils.logTime();
		this.data = data;
		this.log(displayStack);
		this.notify();
		this.persist();
	}

	log(displayStack) {
		log.error(this.name + ': ' + this.message);
		if (this.data) {
			console.log(this.data);
		}
		if (displayStack) {
			console.log(this.getStackTrace());
		}
	}

	getStackTrace() {
		let stack = this.stack.split('\n');
		stack.shift();
		return stack.join('\n');
	}

	notify() {
		//led, sound and sms
		Core.do('interface|led|altLeds', { speed: 30, duration: 1.5 }, { hidden: true });
		Core.do('interface|sound|error', null, { hidden: true });

		if (Core.descriptor.modules.services.base.indexOf('sms') > -1) {
			Core.do('service|sms|sendError', this.message + '\n' + this.data + '\n' + this.time, { hidden: true });
		}
	}

	persist() {
		//persist to file
		let logError = {
			message: this.message,
			data: this.data,
			time: this.time
		};
		Utils.appendJsonFile(Core._LOG + Core.name + '_errorHistory.json', logError);
		Core.errors.push(logError);
	}
};
