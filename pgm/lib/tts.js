#!/usr/bin/env node
// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');

var self = this;
var content;
var messages = '/home/pi/odi/pgm/data/ttsMessages.properties';

var speak = function(lg, txt){
utils.testConnexion(function(connexion){
	if(connexion == true){
		if(txt == '' || txt === 'undefined'){
			content = fs.readFileSync(messages, 'UTF-8').toString().split('\n'); // \r\n
			var rdmMax = content.length;
			var rdmNb = ((Math.floor(Math.random()*rdmMax)));
			txt = content[rdmNb];
			console.log('Random speech : ' + rdmNb + '/' + rdmMax);
			txt = txt.split(';');
			lg = txt[0];
			txt = txt[1];
		}
		console.log('TTS [' + lg + '] "' + txt + '"');
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts.sh', lg, txt]);
		var blinkTime = (txt.length/15) + 1;
		leds.blinkEye((Math.floor(Math.random()*5) + 1)*50, blinkTime);
	} else {
		console.error('No network, can\'t get TTS data /!\\');
		// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts2.sh', lg, txt]); --> espeak
	}
});
};
exports.speak = speak;

var getTTS = function(lg, txt){
};
exports.getTTS = getTTS;