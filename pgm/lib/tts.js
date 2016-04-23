#!/usr/bin/env node
// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
var deploy;
var self = this;
var messages = '/home/pi/odi/pgm/data/ttsMessages.properties';
var content = fs.readFileSync(messages, 'UTF-8').toString().split('\n'); // \r\n
var rdmMax = content.length;
var lastTTSFilePath = '/home/pi/odi/pgm/tmp/lastTTS.log';

var voice;

var speak = function(lg, txt){
utils.clearLastTTS();
utils.testConnexion(function(connexion){
	if(connexion == true){
		// console.log('TTS___ ' + lg +' -> ' + txt);
		if(txt == '' || txt === 'undefined'){
		// if(txt == '' || typeof txt === 'undefined'){
			// content = fs.readFileSync(messages, 'UTF-8').toString().split('\n'); // \r\n
			// var rdmMax = content.length;
			var rdmNb = ((Math.floor(Math.random()*rdmMax)));
			txt = content[rdmNb];
			console.log('Random speech : ' + rdmNb + '/' + rdmMax);
			txt = txt.split(';');
			lg = txt[0];
			txt = txt[1];
		}
		
		voice = Math.round(Math.random());
		console.log('Voice Random = ' + voice);
		if(voice == 1){
			voice = 'googleTTS';
		} else {
			voice = 'espeakTTS';
		}
		console.log('TTS [' + voice + ', ' + lg + '] "' + txt + '"');
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts.sh', voice, lg, txt]);
		var blinkTime = (txt.length/15) + 1;
		leds.blinkEye((Math.round(Math.random()*5) + 1)*50, blinkTime);
		/*fs.appendFile(lastTTSFilePath, lg + ';' + txt, function(err){ // NE PAS CONSERVER L'HISTORIQUE !!!
			if(err) console.error(err);
		});*/
		
		var t = (txt.length) * 300 + 2000;
		// console.log(t);
		// console.log(txt.length);
		var waitFor = (new Date()).getTime();
		// console.error(waitFor);
		// console.log(waitFor + t);
		while((new Date()).getTime() < waitFor + t){
			;
		}
		fs.writeFile(lastTTSFilePath, lg + ';' + txt, 'UTF-8', function(err){
			if(err){
				return console.log('Error while saving last TTS : ' + err);
			}
			// console.log('I\'ll keep this message ;) ' + lg + ';' + txt);
		});
		// return true;
	} else {
		console.error('No network, can\'t get TTS data /!\\');
		// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts2.sh', lg, txt]); --> espeak
	}
});
};
exports.speak = speak;

var lastTTS = function(){
	try{
		var content = fs.readFileSync(lastTTSFilePath, 'UTF-8').toString().split('\n'); // PREVENIR SI FICHIER NON EXISTANT !!!
		// console.log('content=> ' + content);
		txt = content[content.length-1].split(';');
		lg = txt[0];
		txt = txt[1];
		if(typeof lg === 'undefined' || typeof txt === 'undefined'){
			throw e;
		}
	}catch(e){
		console.error(e);
		lg = 'en';
		txt = '.undefined'; // Je n'ai rien dis !
	}
	console.log('LastTTS=> ' + lg + ';' + txt);
	self.speak(lg, txt);
};
exports.lastTTS = lastTTS;

var clearLastTTS = function(){
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearLastTTS']);
	// console.log('LastTTS deleted.');
};
exports.clearLastTTS = clearLastTTS;