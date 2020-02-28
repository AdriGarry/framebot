#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require('./../../../core/Core').Core;

const log = new (require('./../../../api/Logger'))(__filename),
	Flux = require('./../../../api/Flux'),
	Utils = require('./../../../api/Utils');

module.exports = {
	espeak: espeak,
	mbrolaFr1: espeakMbrolaFr1,
	mbrolaFr4: espeakMbrolaFr4,
	google: google,
	pico: pico
};

function espeak(tts) {
	let speed = Utils.random(100, 150); //100-150
	let pitch = Utils.random(30, 60); // 30-60
	let volume = Core.run('volume') * 2.5;
	spawn('espeak', ['-v', tts.lg, '-s', speed, '-p', pitch, '-a', volume, tts.msg]);
}

function espeakMbrolaFr1(tts) {
	let speed = Utils.random(130, 200); //130-200
	let pitch = Utils.random(30, 60); // 30-60
	let volume = Core.run('volume') * 2.5;
	spawn('espeak', ['-v', 'mb/mb-fr1', '-s', speed, '-a', volume, '-p', pitch, tts.msg]);
}

function espeakMbrolaFr4(tts) {
	let speed = Utils.random(130, 160); //130-160
	let pitch = Utils.random(30, 60); // 30-60
	let volume = Core.run('volume') * 2.5;
	spawn('espeak', ['-v', 'mb/mb-fr4', '-s', speed, '-a', volume, '-p', pitch, tts.msg]);
}

function google(tts) {
	let lg = tts.lg;
	let msg = tts.msg;
	let url = `http://translate.google.com/translate_tts?tl=${lg}&client=tw-ob&q=${msg}`;
	new Flux('interface|sound|play', { url: url, volume: Core.run('volume') * 3, noLog: true }, { log: 'trace' });
}

function pico(tts) {
	let language = tts.lg == 'en' ? 'en-US' : 'fr-FR';
	let volume = Core.run('volume') * 2.5; // 175-300
	let command = 'pico2wave -l ' + language + ' -w ' + Core._TMP + 'picoTTS.wav "' + tts.msg + '"';
	exec(command, (err, stdout, stderr) => {
		if (err) Core.error(err);
		if (stderr) Core.error(stderr);
		log.info(stdout);
		new Flux('interface|sound|play', { mp3: Core._TMP + 'picoTTS.wav', volume: volume, noLog: false });
	});
}
