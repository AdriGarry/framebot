#!/usr/bin/env node
// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');

var self = this;
var content;
var messages = '/home/pi/odi/pgm/data/ttsMessages.txt';

var speak = function(lg, txt){
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
	console.log('TTS: "' + txt + '"');
	switch(lg) {
		case 'en':
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/ttsEn.sh', txt]);
			break;
		case 'es':
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/ttsEs.sh', txt]);
			break;
		case 'it':
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/ttsIt.sh', txt]);
			break;
		case 'de':
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/ttsDe.sh', txt]);
			break;
		default:
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/ttsFr.sh', txt]);
	}
	//if(txt === 'undefined') txt = '';
	var blinkTime = (txt.length/15) + 1;
	//console.log('blinkTime : ' + blinkTime);
	leds.blinkEye((Math.floor(Math.random()*5) + 1)*50, blinkTime);
};
exports.speak = speak;

var speakRdmDelayLoop = function(){
	console.log('Mode On >> TTS Exclamation Loop With Random Delay !!!');
	var exclRdmLp;
	var rdmDelay;
	(function loop() {
		setTimeout(function() {
			rdmDelay = Math.floor(Math.random() * 400); //400
			console.log('[rdmDelay] Next TTS Exclamation -> '
				+ Math.round((rdmDelay/60)*10)/10 + ' min (' + rdmDelay + ' sec)');
			leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
			self.speak('','');
			if(mode.readSync() == 1){
				console.log('speakRdmDelayLoop... LET\'S GO ON !!!');
				loop();
			}
			else{
				console.log('Not Going ON');
			}
		}, rdmDelay * 1000);
	}());	
};
exports.speakRdmDelayLoop = speakRdmDelayLoop;