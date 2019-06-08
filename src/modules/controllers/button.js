#!/usr/bin/env node
'use strict';

const Gpio = require('onoff').Gpio;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

var Button = {},
	LED_FLAG;
Core.gpio.leds.forEach(led => {
	if (led.id == 'buttonFlag') LED_FLAG = new Gpio(led.pin, led.direction);
});
if (!LED_FLAG) Core.error('LED_FLAG not initialized!');

Core.gpio.buttons.forEach(button => {
	Button[button.id] = new Gpio(button.pin, button.direction, button.edge, button.options);
	Button[button.id]['id'] = button.id;
	Button[button.id]['name'] = Utils.capitalizeFirstLetter(button.id);
	Button[button.id]['edge'] = button.edge;
	Core.run('buttonStats.' + button.id, 0);
});

setImmediate(() => {
	Core.do('interface|sound|volume', Core.isAwake() ? (Button.etat.readSync() ? 100 : 50) : 0);
	// TODO move this somewhere else ==> hardware ? sound ?
});

Object.keys(Button).forEach(id => {
	let button = Button[id];
	button.watch((err, value) => {
		if (err) Core.error('Button error', err);
		let buttonData = getButtonData(button);
		Core.do('controller|button|' + button.id, buttonData);
	});
});

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
		var time = Math.round((new Date() - startPushTime) / 100) / 10;
		if (time % 1 == 0) LED_FLAG.writeSync(0);
		else LED_FLAG.writeSync(1);
	}
	LED_FLAG.writeSync(0);
	let pushTime = Math.round((new Date() - startPushTime) / 100) / 10;
	log.info(button.name + ' button pressed for ' + pushTime + ' sec...');
	return pushTime;
}

// var instance = false,
// 	intervalEtat;
// const INTERVAL_DELAY = (Core.conf('watcher') ? 60 : 5 * 60) * 1000; //3 * 60 * 1000;
// setInterval(function() {
// 	// TODO A deplacer dans flux.next('service|context|refresh')) ?
// 	let value = Button.etat.readSync();
// 	// TODO faire un truc avec ce flux => move to jobsList.json?
// 	// Core.do('interface|led|toggle', { leds: ['satellite'], value: value }, { log: 'trace' });
// 	// Core.run('etat', value ? 'high' : 'low');

// 	if (1 === value) {
// 		if (!instance) {
// 			// TODO! deplacer ça dans le handler ... !?
// 			instance = true;
// 			intervalEtat = setInterval(function() {
// 				log.info('Etat btn Up => random action');
// 				Core.do('service|interaction|random');
// 			}, INTERVAL_DELAY);
// 			Core.do('service|video|loop');
// 		}
// 	} else {
// 		instance = false;
// 		clearInterval(intervalEtat);
// 	}
// }, 2000);
