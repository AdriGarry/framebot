#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {
	speak: google
};

function google(tts) {
	// spawn('mplayer',[ -volume  -really-quiet -noconsolecontrols "$url"]);
	let lg = tts.lg;
	let msg = tts.msg;
	let url = `http://translate.google.com/translate_tts?tl=${lg}&client=tw-ob&q=${msg}`;
	console.log(url);
	Core.do('interface|sound|playUrl', { url: url, noLog: true });
}
