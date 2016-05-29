#!/usr/bin/env node
// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
var deploy;
var self = this;

var messagesPath = '/home/pi/odi/pgm/data/ttsMessages.properties';
var messages = fs.readFileSync(messagesPath, 'UTF-8').toString().split('\n'); // \r\n
var rdmMaxMessages = messages.length;

var conversationsPath = '/home/pi/odi/pgm/data/ttsConversations.properties';
var conversations = fs.readFileSync(conversationsPath, 'UTF-8').toString().split('\n\n'); // \r\n
var rdmMaxConversations = conversations.length;

var lastTTSFilePath = '/home/pi/odi/pgm/tmp/lastTTS.log';

/** Fonction speak TTS (synthetisation vocale espeak & google translate) */
var voice;
var speak = function(lg, txt){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			// if(txt == '' || typeof txt === 'undefined'){
			if(typeof txt !== 'undefined'){
				if(txt.toUpperCase().indexOf('RANDOM') > -1){
					var rdmNb = ((Math.floor(Math.random()*rdmMaxMessages)));
					txt = messages[rdmNb];
					console.log('Random speech : ' + rdmNb + '/' + rdmMaxMessages);
					txt = txt.split(';');
					lg = txt[0];
					txt = txt[1];
				}
				txt = txt.split(':');
				voice = txt[1];
				if(typeof voice == 'undefined'){
					voice = Math.round(Math.random()*4);
					// console.log('Voice Random = ' + voice);
				}
				if(voice <= 1){
					voice = 'espeakTTS';
				} else {
					voice = 'googleTTS';
				}
				txt = txt[0];
				console.log('TTS [' + voice + ', ' + lg + '] "' + txt + '"');
				deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts.sh', voice, lg, txt]);
				var blinkTime = (txt.length/15) + 1;
				leds.blinkEye((Math.round(Math.random()*5) + 1)*50, blinkTime);

				fs.writeFile(lastTTSFilePath, lg + ';' + txt, 'UTF-8', function(err){
					if(err){
						return console.log('Error while saving last TTS : ' + err);
					}
					// console.log('I\'ll keep this message ;) ' + lg + ';' + txt);
				});
			}
			// return true;
		} else {
			// console.error('No network, can\'t get TTS data /!\\');
			deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts.sh', 'espeakTTS', lg, txt]);
		}
	});
};
exports.speak = speak;

/** ######### */
var params = process.argv[2];
try{
	params = params.split('_');
	var lgParam = params[0];
	// params = params.shift();
	params.splice(0, 1);
	// console.log('A: ' + lgParam + ', ' + params);
	var txtParam = params.join(' ');
	// console.log('B: ' + lgParam + ', ' + txtParam);
	txtParam = txtParam.replace('#',':');
}catch(e){
	if(typeof params !== 'undefined'){
		console.error('Exception while getting speak param at init : ' + e);
	}
}

if(typeof lgParam != 'undefined' && lgParam !='' && typeof txtParam != 'undefined' && txtParam !=''){
	console.log('TTS_PARAMS: ' + lgParam + ', ' + txtParam);
	self.speak(lgParam, txtParam);
}

/** Fonction conversation TTS */
var conversation = function(messages){
	console.log('Service Conversation... ' + messages);
	try{
		if(typeof messages == 'undefined') throw (messages);
		// Mettre un 2eme Try catch imbriqué...
		if( messages.constructor != Array){// typeof messages == 'undefined' ||       // IS EMPTY
			if(messages.constructor == Number && messages != NaN && messages <= rdmMaxConversations-1){
				messages = conversations[messages];
			}else{
				var rdmNb = ((Math.floor(Math.random()*rdmMaxConversations)));
				messages = conversations[rdmNb];
				console.log('Random conversation : ' + (rdmNb+1) + '/' + rdmMaxConversations);
			}
			messages = messages.split('\n');
		}
		var delay = 1;
		messages.forEach(function(message){
			// console.log('__ ' + delay/1000);
			setTimeout(function(message){
				message = message.split(';');
				var lg = message[0];
				var txt = message[1];
				self.speak(lg, txt);
			}.bind(this, message), delay+2500);
			delay += message.length*120;
		});
	}catch(e){
		self.speak('fr','erreur conversation:1');
		console.error('conversation_error : ' + e);
	}
};
exports.conversation = conversation;

/** Fonction last speak TTS */
var lastTTS = function(){
	try{
		var lastMsg = fs.readFileSync(lastTTSFilePath, 'UTF-8').toString().split('\n'); // PREVENIR SI FICHIER NON EXISTANT !!!
		// console.log('lastMsg=> ' + lastMsg);
		txt = lastMsg[lastMsg.length-1].split(';');
		lg = txt[0];
		txt = txt[1];
		if(typeof lg === 'undefined' || typeof txt === 'undefined'){
			throw e;
		}
	}catch(e){
		console.error(e);
		lg = 'en';
		txt = '.undefined:0';
	}
	console.log('LastTTS=> ' + lg + ';' + txt);
	self.speak(lg, txt);
};
exports.lastTTS = lastTTS;

/** Fonction suppression last speak TTS */
var clearLastTTS = function(){
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearLastTTS']);
	console.log('LastTTS cleared.');
};
exports.clearLastTTS = clearLastTTS;