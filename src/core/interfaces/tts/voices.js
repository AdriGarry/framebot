#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	espeak: espeak,
	google: google,
	pico: pico
};

function espeak(tts) {
	let speed = Utils.random(100, 150); //0-99
	let pitch = Utils.random(30, 60); // 80-450 / 100-200 / 130-150
	let volume = Core.run('volume') * 2.5; // 175-300
	spawn('espeak', ['-v', tts.lg, '-s', speed, '-p', pitch, '-a', volume, tts.msg]);
}

function google(tts) {
	let lg = tts.lg;
	let msg = tts.msg;
	let url = `http://translate.google.com/translate_tts?tl=${lg}&client=tw-ob&q=${msg}`;
	Core.do('interface|sound|play', { url: url, volume: Core.run('volume') * 3, noLog: true });
}

function pico(tts) {
	let language = tts.lg == 'en' ? 'en-US' : 'fr-FR';
	exec(
		'pico2wave -l ' +
			language +
			' -w ' +
			Core._TMP +
			'pico2waveTTS.wav "' +
			tts.msg +
			'" && mplay ' +
			Core._TMP +
			'pico2waveTTS.wav'
	);
}
