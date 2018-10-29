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
	let volume = Core.run('volume') * 2.5;
	spawn('espeak', ['-v', tts.lg, '-s', speed, '-p', pitch, '-a', volume, tts.msg]);
}

function google(tts) {
	let lg = tts.lg;
	let msg = tts.msg;
	let url = `http://translate.google.com/translate_tts?tl=${lg}&client=tw-ob&q=${msg}`;
	Core.do('interface|sound|play', { url: url, volume: Core.run('volume') * 3, noLog: true }, { hidden: true });
}

function pico(tts) {
	let language = tts.lg == 'en' ? 'en-US' : 'fr-FR';
	// let pico2wave = spawn('pico2wave', ['-l', language, '-w', Core._PATH + 'pico2waveTTS.wav "' + tts.msg + '"']);
	// pico2wave.on('close', code => {
	// 	console.log(`child process exited with code ${code}`);
	// 	Core.do('interface|sound|play', { mp3: Core._PATH + 'pico2waveTTS.wav', noLog: true });
	// });
	let volume = Core.run('volume') * 2.5; // 175-300
	let command = 'pico2wave -l ' + language + ' -w ' + Core._TMP + 'picoTTS.wav "' + tts.msg + '"';
	exec(command, (error, stdout, stderr) => {
		console.log(stdout); // TODO...
		Core.do('interface|sound|play', { mp3: Core._TMP + 'picoTTS.wav', volume: volume, noLog: false });
	});
}
