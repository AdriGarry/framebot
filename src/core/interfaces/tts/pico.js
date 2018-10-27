#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	speak: pico
};

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
