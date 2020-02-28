#!/usr/bin/env node

'use strict';

module.exports = class Cat {
	constructor(name, color) {
		this.name = name;
		this.color = color;
		//_sleep.bind(this);
	}

	meow() {
		console.log('Meow from', this.name);
	}

	sleep(hours) {
		_sleep(this, hours);
	}
};

function _sleep(cat, hours) {
	console.log('ZZZZZZZ (private) sleep for', hours, 'hours');
	console.log('Cat name:', cat);
}
