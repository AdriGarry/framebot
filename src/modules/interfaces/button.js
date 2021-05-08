#!/usr/bin/env node
'use strict';

const Gpio = require('onoff').Gpio;

const Core = require('./../../core/Core').Core;

const { Flux, Logger, Utils } = require('./../../api');

const log = new Logger(__filename);

var Button = {},
	LED_FLAG;

Core.gpio.leds.forEach(led => {
	if (led.id == 'buttonFlag') LED_FLAG = new Gpio(led.pin, led.direction);
});
if (!LED_FLAG) Core.error('LED_FLAG not initialized!');

let buttonsForStats = {}
Core.gpio.buttons.forEach(button => {
	Button[button.id] = new Gpio(button.pin, button.direction, button.edge, button.options);
	Button[button.id]['id'] = button.id;
	Button[button.id]['name'] = Utils.capitalizeFirstLetter(button.id);
	Button[button.id]['edge'] = button.edge;
	buttonsForStats[button.id] = 0;
});
Core.run('stats.buttons', buttonsForStats)

setImmediate(() => {
	Object.keys(Button).forEach(id => {
		watchButton(Button[id]);
		getEdgeButtonValue(Button[id]);
	});
});

function watchButton(button) {
	button.watch((err, value) => {
		if (err) Core.error('Button error', err);
		let buttonData = getButtonData(button);
		new Flux('service|buttonAction|' + button.id, buttonData);
	});
}

function getEdgeButtonValue(button) {
	if (button.edge == 'both') {
		setTimeout(() => {
			let buttonData = getButtonData(button);
			new Flux('service|buttonAction|' + button.id, buttonData);
		}, 100);
	}
}

function getButtonData(button) {
	if (button.edge == 'rising') {
		return getPushTime(button);
	} else if (button.edge == 'both') {
		return button.readSync();
	} else {
		return;
	}
}

function getPushTime(button) {
	LED_FLAG.writeSync(1);
	let startPushTime = new Date();
	while (button.readSync() == 1) {
		let time = Math.round((new Date() - startPushTime) / 100) / 10;
		if (time % 1 == 0) LED_FLAG.writeSync(0);
		else LED_FLAG.writeSync(1);
	}
	LED_FLAG.writeSync(0);
	let pushTime = Math.round((new Date() - startPushTime) / 100) / 10;
	log.info(button.name + ' button pressed for ' + pushTime + ' sec...');
	return pushTime;
}
