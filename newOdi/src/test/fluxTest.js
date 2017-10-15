#!/usr/bin/env node
"use strict";

var Odi = require(ODI_PATH + "src/core/Odi.js").Odi;
var log = new (require(Odi.CORE_PATH + "Logger.js"))(__filename.match(/(\w*).js/g)[0]);
log.INFO(">> LAUNCHING TEST SEQUENCE...");

const Rx = require("rxjs");

var Flux = require(Odi.CORE_PATH + 'Flux.js');

setTimeout(() => {
	Flux.next('module', 'sound', 'mute', 'MUTE');
	Flux.next('module', 'led', 'blink', 'eye...', 2);
	Flux.next('service', 'tts', 'speak', 'say something...', 1.5, 3);
	Flux.next('module', 'sound', 'mute', 'MUTE', 15);
}, 500);
