#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	speak: espeak
};

function espeak(tts) {
	let speed = Utils.random(100, 150); //0-99
	let pitch = Utils.random(30, 60); // 80-450 / 100-200 / 130-150
	let volume = Core.run('volume') * 2.5; // 175-300
	spawn('espeak', ['-v', tts.lg, '-s', speed, '-p', pitch, '-a', volume, tts.msg]);
}
